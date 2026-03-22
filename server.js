import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

import AuthRoutes from './routes/auth.routes.js';
import SportRoutes from './routes/sport.routes.js';
import WorkoutRoutes from './routes/workout.routes.js';
import DaysRoutes from './routes/days.routes.js';
import ExercisesRoutes from './routes/exercieses.routes.js';
import SessionRoutes from './routes/session.routes.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthRoutes);
app.use('/api/sports', SportRoutes);
app.use('/api/workouts', WorkoutRoutes);
app.use('/api/days', DaysRoutes);
app.use('/api/exercises', ExercisesRoutes);
app.use('/api/session', SessionRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(` server runing on PORT ${PORT} : `));