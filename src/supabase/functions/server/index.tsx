import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from "@jsr/supabase__supabase-js";
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors());

// Initialize Supabase client for server-side operations
// Note: In production, you should use the service role key for admin operations
const supabase = createClient(
  'https://lzsyfhoxmfkgyepnxpzo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6c3lmaG94bWZrZ3llcG54cHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMTE0MDAsImV4cCI6MjA4MTc4NzQwMH0.Purg6UrZPYcTjQAmnyBBpihQNxXOrfEMIz__RTsD4Jo'
);

// Helper function to get user from token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// ============ AUTH ROUTES ============

app.post('/make-server-d4a017ee/signup', async (c) => {
  try {
    const { email, password, name, gender, age, height, weight, goal, activityLevel, dietPreference, noProfile } = await c.req.json();
    
    // Note: This endpoint is deprecated - use client-side signup instead
    // But we'll provide a graceful response for backward compatibility
    
    console.log('⚠️ Server-side signup called - redirecting to client-side signup');
    return c.json({ 
      error: 'Server-side signup is deprecated. Please use client-side signup.',
      redirectTo: 'client-side'
    }, 400);
    
    // OLD CODE (commented out):
    // Create user with Supabase Auth
    // const { data, error } = await supabase.auth.admin.createUser({
    //   email,
    //   password,
    //   email_confirm: true, // Auto-confirm since email server isn't configured
    //   user_metadata: { name }
    // });
    // 
    // if (error) {
    //   console.error('Signup error:', error);
    //   return c.json({ error: error.message }, 400);
    // }
    // 
    // // Optionally skip profile creation (useful for tests)
    // if (!noProfile) {
    //   // Store user profile in KV store
    //   const profile = {
    //     userId: data.user.id,
    //     name,
    //     email,
    //     gender,
    //     age,
    //     height,
    //     weight,
    //     goal,
    //     activityLevel,
    //     dietPreference,
    //     createdAt: new Date().toISOString()
    //   };
    //   
    //   await kv.set(`user:${data.user.id}:profile`, profile);
    //   
    //   // Initialize first weight log
    //   const weightLog = {
    //     userId: data.user.id,
    //     weight,
    //     date: new Date().toISOString(),
    //     logId: Date.now().toString()
    //   };
    //   await kv.set(`user:${data.user.id}:weight:${weightLog.logId}`, weightLog);
    // }
    // 
    // return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.get('/make-server-d4a017ee/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}:profile`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

app.put('/make-server-d4a017ee/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const updates = await c.req.json();
    const existingProfile = await kv.get(`user:${user.id}:profile`);
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      userId: user.id,
      email: user.email
    };
    
    await kv.set(`user:${user.id}:profile`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ============ WORKOUT ROUTES ============

const workoutLibrary = [
  {
    id: '1',
    name: 'Full Body Strength',
    category: 'Home',
    duration: 30,
    difficulty: 'Beginner',
    calories: 250,
    exerciseCount: 8,
    exercises: [
      { name: 'Push-ups', reps: 15, sets: 3, tips: 'Keep your core tight and back straight' },
      { name: 'Squats', reps: 20, sets: 3, tips: 'Push through your heels, keep knees behind toes' },
      { name: 'Plank', duration: 45, sets: 3, tips: 'Keep body in straight line from head to heels' },
      { name: 'Lunges', reps: 12, sets: 3, tips: 'Keep front knee at 90 degrees' },
      { name: 'Mountain Climbers', duration: 30, sets: 3, tips: 'Keep hips level and core engaged' },
      { name: 'Tricep Dips', reps: 12, sets: 3, tips: 'Keep elbows close to body' },
      { name: 'Jumping Jacks', duration: 45, sets: 3, tips: 'Land softly on the balls of your feet' },
      { name: 'Bicycle Crunches', reps: 20, sets: 3, tips: 'Touch elbow to opposite knee' }
    ]
  },
  {
    id: '2',
    name: 'Cardio Blast',
    category: 'Cardio',
    duration: 20,
    difficulty: 'Intermediate',
    calories: 300,
    exerciseCount: 6,
    exercises: [
      { name: 'Burpees', reps: 15, sets: 4, tips: 'Jump explosively and land softly' },
      { name: 'High Knees', duration: 45, sets: 4, tips: 'Drive knees up to hip level' },
      { name: 'Jump Squats', reps: 15, sets: 4, tips: 'Land softly and immediately go into next rep' },
      { name: 'Sprint in Place', duration: 30, sets: 4, tips: 'Pump arms and lift knees high' },
      { name: 'Box Jumps', reps: 12, sets: 4, tips: 'Step down to protect knees' },
      { name: 'Jump Rope', duration: 60, sets: 3, tips: 'Keep elbows close to body' }
    ]
  },
  {
    id: '3',
    name: 'Upper Body Focus',
    category: 'Gym',
    duration: 45,
    difficulty: 'Advanced',
    calories: 350,
    exerciseCount: 7,
    exercises: [
      { name: 'Bench Press', reps: 10, sets: 4, tips: 'Keep shoulder blades pinched together' },
      { name: 'Pull-ups', reps: 8, sets: 4, tips: 'Full range of motion, chin over bar' },
      { name: 'Overhead Press', reps: 10, sets: 4, tips: 'Keep core braced throughout' },
      { name: 'Barbell Rows', reps: 12, sets: 4, tips: 'Pull to lower chest, squeeze shoulder blades' },
      { name: 'Dumbbell Flyes', reps: 12, sets: 3, tips: 'Keep slight bend in elbows' },
      { name: 'Bicep Curls', reps: 12, sets: 3, tips: 'Keep elbows stationary' },
      { name: 'Tricep Extensions', reps: 12, sets: 3, tips: 'Only move forearms' }
    ]
  },
  {
    id: '4',
    name: 'Yoga Flow',
    category: 'Home',
    duration: 25,
    difficulty: 'Beginner',
    calories: 150,
    exerciseCount: 8,
    exercises: [
      { name: 'Sun Salutation', reps: 5, sets: 1, tips: 'Move with your breath' },
      { name: 'Warrior Pose', duration: 30, sets: 2, tips: 'Keep back leg strong and straight' },
      { name: 'Tree Pose', duration: 30, sets: 2, tips: 'Focus on a point ahead for balance' },
      { name: 'Child\'s Pose', duration: 60, sets: 3, tips: 'Breathe deeply into your back' },
      { name: 'Downward Dog', duration: 45, sets: 3, tips: 'Push hips up and back' },
      { name: 'Cobra Pose', duration: 30, sets: 3, tips: 'Keep shoulders away from ears' },
      { name: 'Pigeon Pose', duration: 45, sets: 2, tips: 'Breathe through the stretch' },
      { name: 'Savasana', duration: 120, sets: 1, tips: 'Let your body fully relax' }
    ]
  },
  {
    id: '5',
    name: 'Core Crusher',
    category: 'Home',
    duration: 15,
    difficulty: 'Intermediate',
    calories: 180,
    exerciseCount: 6,
    exercises: [
      { name: 'Crunches', reps: 25, sets: 4, tips: 'Lift shoulder blades off ground' },
      { name: 'Russian Twists', reps: 30, sets: 4, tips: 'Keep feet off ground for advanced' },
      { name: 'Leg Raises', reps: 15, sets: 4, tips: 'Keep lower back pressed to floor' },
      { name: 'Plank Hold', duration: 60, sets: 3, tips: 'Don\'t let hips sag' },
      { name: 'Side Plank', duration: 30, sets: 3, tips: 'Stack feet and keep body straight' },
      { name: 'Flutter Kicks', duration: 45, sets: 3, tips: 'Keep movements small and controlled' }
    ]
  },
  {
    id: '6',
    name: 'Lower Body Burn',
    category: 'Gym',
    duration: 40,
    difficulty: 'Advanced',
    calories: 380,
    exerciseCount: 6,
    exercises: [
      { name: 'Barbell Squats', reps: 10, sets: 5, tips: 'Go below parallel if mobility allows' },
      { name: 'Romanian Deadlifts', reps: 10, sets: 4, tips: 'Feel the stretch in hamstrings' },
      { name: 'Leg Press', reps: 15, sets: 4, tips: 'Push through heels' },
      { name: 'Walking Lunges', reps: 20, sets: 3, tips: 'Take big steps forward' },
      { name: 'Leg Curls', reps: 12, sets: 3, tips: 'Control the negative' },
      { name: 'Calf Raises', reps: 20, sets: 4, tips: 'Full range of motion' }
    ]
  }
];

app.get('/make-server-d4a017ee/workouts', async (c) => {
  try {
    const category = c.req.query('category');
    
    let filteredWorkouts = workoutLibrary;
    if (category && category !== 'All') {
      filteredWorkouts = workoutLibrary.filter(w => w.category === category);
    }
    
    return c.json({ workouts: filteredWorkouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    return c.json({ error: 'Failed to get workouts' }, 500);
  }
});

app.post('/make-server-d4a017ee/workouts/log', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { workoutId, workoutName, duration, calories, completedAt } = await c.req.json();
    
    const logId = Date.now().toString();
    const workoutLog = {
      userId: user.id,
      workoutId,
      workoutName,
      duration,
      calories,
      completedAt: completedAt || new Date().toISOString(),
      logId
    };
    
    await kv.set(`user:${user.id}:workout:${logId}`, workoutLog);
    
    return c.json({ success: true, log: workoutLog });
  } catch (error) {
    console.error('Log workout error:', error);
    return c.json({ error: 'Failed to log workout' }, 500);
  }
});

app.get('/make-server-d4a017ee/workouts/history', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const logs = await kv.getByPrefix(`user:${user.id}:workout:`);
    const sortedLogs = logs.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    return c.json({ logs: sortedLogs });
  } catch (error) {
    console.error('Get workout history error:', error);
    return c.json({ error: 'Failed to get workout history' }, 500);
  }
});

// ============ FOOD ROUTES ============

app.post('/make-server-d4a017ee/food/log', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { foodName, calories, protein, carbs, fats, mealType, loggedAt } = await c.req.json();
    
    const logId = Date.now().toString();
    const foodLog = {
      userId: user.id,
      foodName,
      calories,
      protein,
      carbs,
      fats,
      mealType,
      loggedAt: loggedAt || new Date().toISOString(),
      logId
    };
    
    await kv.set(`user:${user.id}:food:${logId}`, foodLog);
    
    return c.json({ success: true, log: foodLog });
  } catch (error) {
    console.error('Log food error:', error);
    return c.json({ error: 'Failed to log food' }, 500);
  }
});

app.get('/make-server-d4a017ee/food/history', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const date = c.req.query('date');
    const logs = await kv.getByPrefix(`user:${user.id}:food:`);
    
    let filteredLogs = logs;
    if (date) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.loggedAt).toISOString().split('T')[0];
        return logDate === date;
      });
    }
    
    const sortedLogs = filteredLogs.sort((a, b) => 
      new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
    
    return c.json({ logs: sortedLogs });
  } catch (error) {
    console.error('Get food history error:', error);
    return c.json({ error: 'Failed to get food history' }, 500);
  }
});

app.post('/make-server-d4a017ee/food/analyze', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Mock AI analysis - in real app, this would use computer vision API
    const mockFoods = [
      { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, confidence: 0.92 },
      { name: 'Caesar Salad', calories: 350, protein: 8, carbs: 15, fats: 28, confidence: 0.88 },
      { name: 'Rice Bowl with Vegetables', calories: 420, protein: 12, carbs: 68, fats: 10, confidence: 0.85 },
      { name: 'Pepperoni Pizza (2 slices)', calories: 550, protein: 24, carbs: 58, fats: 24, confidence: 0.90 },
      { name: 'Salmon with Broccoli', calories: 380, protein: 35, carbs: 12, fats: 20, confidence: 0.91 },
      { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 25, fats: 2, confidence: 0.87 }
    ];
    
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    
    return c.json({ 
      success: true, 
      analysis: randomFood
    });
  } catch (error) {
    console.error('Analyze food error:', error);
    return c.json({ error: 'Failed to analyze food' }, 500);
  }
});

// ============ PROGRESS ROUTES ============

app.get('/make-server-d4a017ee/stats', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's food logs
    const foodLogs = await kv.getByPrefix(`user:${user.id}:food:`);
    const todaysFoodLogs = foodLogs.filter(log => {
      const logDate = new Date(log.loggedAt).toISOString().split('T')[0];
      return logDate === today;
    });
    
    const caloriesConsumed = todaysFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    
    // Get today's workout logs
    const workoutLogs = await kv.getByPrefix(`user:${user.id}:workout:`);
    const todaysWorkouts = workoutLogs.filter(log => {
      const logDate = new Date(log.completedAt).toISOString().split('T')[0];
      return logDate === today;
    });
    
    const caloriesBurned = todaysWorkouts.reduce((sum, log) => sum + (log.calories || 0), 0);
    const workoutCompleted = todaysWorkouts.length > 0;
    
    // Mock steps - in real app, would integrate with device pedometer
    const steps = Math.floor(Math.random() * 5000) + 3000;
    
    return c.json({
      stats: {
        caloriesConsumed,
        caloriesBurned,
        steps,
        workoutCompleted
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

app.post('/make-server-d4a017ee/weight/log', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { weight, date } = await c.req.json();
    
    const logId = Date.now().toString();
    const weightLog = {
      userId: user.id,
      weight,
      date: date || new Date().toISOString(),
      logId
    };
    
    await kv.set(`user:${user.id}:weight:${logId}`, weightLog);
    
    // Also update profile with latest weight
    const profile = await kv.get(`user:${user.id}:profile`);
    if (profile) {
      profile.weight = weight;
      await kv.set(`user:${user.id}:profile`, profile);
    }
    
    return c.json({ success: true, log: weightLog });
  } catch (error) {
    console.error('Log weight error:', error);
    return c.json({ error: 'Failed to log weight' }, 500);
  }
});

app.get('/make-server-d4a017ee/weight/history', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const logs = await kv.getByPrefix(`user:${user.id}:weight:`);
    const sortedLogs = logs.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return c.json({ logs: sortedLogs });
  } catch (error) {
    console.error('Get weight history error:', error);
    return c.json({ error: 'Failed to get weight history' }, 500);
  }
});

// ============ AI COACH ROUTES ============

app.post('/make-server-d4a017ee/coach/chat', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { message } = await c.req.json();
    const messageLower = message.toLowerCase();
    
    // Keyword-based AI responses
    let aiResponse = '';
    
    if (messageLower.includes('eat') || messageLower.includes('meal') || messageLower.includes('food')) {
      const responses = [
        "For a balanced diet, focus on lean proteins, whole grains, and plenty of vegetables. Aim for 5-6 small meals throughout the day to keep your metabolism active!",
        "Great question! Try to eat protein with every meal - chicken, fish, eggs, or plant-based options like lentils. Don't forget healthy fats from nuts and avocados!",
        "Meal prep is key! Prepare your meals on Sunday for the week. Include a palm-sized portion of protein, a fist-sized portion of carbs, and fill half your plate with vegetables.",
        "Stay hydrated! Drink at least 8 glasses of water daily. Before meals, try eating a piece of fruit or drinking water to help with portion control."
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    } else if (messageLower.includes('workout') || messageLower.includes('exercise') || messageLower.includes('train')) {
      const responses = [
        "I recommend a mix of strength training and cardio! Try 3-4 days of resistance training and 2-3 days of cardio per week. Don't forget rest days for recovery!",
        "Start with compound movements like squats, deadlifts, and bench press. These work multiple muscle groups and burn more calories. Aim for 3 sets of 8-12 reps.",
        "HIIT workouts are excellent for burning fat! Try 30 seconds of intense exercise followed by 30 seconds of rest, repeated for 15-20 minutes. Check out our Cardio Blast workout!",
        "Consistency is more important than intensity. It's better to do moderate workouts regularly than intense workouts sporadically. Start with 3 days a week and build up!"
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    } else if (messageLower.includes('weight') || messageLower.includes('lose') || messageLower.includes('gain')) {
      const responses = [
        "Weight management is about calories in vs calories out. To lose weight, create a 500 calorie deficit daily. To gain muscle, eat in a slight surplus with plenty of protein!",
        "Track your calories consistently for 2 weeks to understand your baseline. Then adjust by 200-300 calories based on your goal. Be patient - sustainable changes take time!",
        "For weight loss, combine a caloric deficit with strength training to preserve muscle. Aim to lose 1-2 pounds per week for sustainable results.",
        "Building muscle requires progressive overload in the gym and eating 0.8-1g of protein per pound of bodyweight. Be patient - muscle growth takes months, not weeks!"
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    } else if (messageLower.includes('motivat') || messageLower.includes('tired') || messageLower.includes('give up')) {
      const responses = [
        "You've got this! Remember, every workout counts. Even on days you don't feel like it, showing up is half the battle. Your future self will thank you! 💪",
        "Feeling tired is normal, but don't let it stop you. Start with just 10 minutes - you'll often find energy once you begin. Small steps lead to big changes!",
        "Focus on how you FEEL after a workout, not how you feel before. You never regret a workout! Your body is capable of amazing things - believe in yourself!",
        "Progress isn't linear. There will be ups and downs, but consistency is key. Look back at where you started and celebrate how far you've come! Keep pushing! 🔥"
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "I'm here to help with your fitness journey! Ask me about workouts, nutrition, weight management, or if you need motivation. What would you like to know?",
        "Great to hear from you! I can provide guidance on exercise routines, meal planning, and staying motivated. How can I support your fitness goals today?",
        "Remember: fitness is a journey, not a destination! Stay consistent, trust the process, and results will come. What specific area would you like help with?",
        "Your dedication is inspiring! Whether you need workout tips, nutrition advice, or a motivational boost, I'm here for you. What's on your mind?"
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Save messages to chat history
    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();
    
    const userMessage = {
      userId: user.id,
      messageId: userMessageId,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    const aiMessage = {
      userId: user.id,
      messageId: aiMessageId,
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`user:${user.id}:chat:${userMessageId}`, userMessage);
    await kv.set(`user:${user.id}:chat:${aiMessageId}`, aiMessage);
    
    return c.json({ success: true, response: aiResponse, messages: [userMessage, aiMessage] });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Failed to process message' }, 500);
  }
});

app.get('/make-server-d4a017ee/coach/history', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const messages = await kv.getByPrefix(`user:${user.id}:chat:`);
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.error('Get chat history error:', error);
    return c.json({ error: 'Failed to get chat history' }, 500);
  }
});

// Health check
app.get('/make-server-d4a017ee/health', (c) => {
  return c.json({ status: 'ok', message: 'Fit Kro API is running' });
});

Deno.serve(app.fetch);
