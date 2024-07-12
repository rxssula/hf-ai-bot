import express from 'express';
import Classifier from 'ml-classify-text';
import mongoose, { Document, Model } from 'mongoose';
import cors from 'cors';

const router = express.Router();

// MongoDB connection
const mongoURI = 'mongodb+srv://miraskural:q1w2e3r4@cluster0.dpeedha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// MongoDB schemas and types
interface ICandidate extends Document {
    category: string;
    telegram: string;
    instagram: string;
    github: string;
    education: string;
    specialization: string;
    workplace: string;
    experience: string;
    projects: string;
    achievements: string;
    isValid: boolean;
    prediction?: string;
    confidence?: number;
    status?: string;
    humanDecision?: string;
    reasonForDecision?: string;
}

interface CandidateInput {
    category: string;
    telegram: string;
    instagram: string;
    github: string;
    education: string;
    specialization: string;
    workplace: string;
    experience: string;
    projects: string;
    achievements: string;
    isValid: boolean;
}

interface PredictionResult {
    label: string;
    confidence: number;
}

interface CandidatePrediction {
    candidate: CandidateInput;
    prediction: PredictionResult;
}

const CandidateSchema = new mongoose.Schema<ICandidate>({
    category: String,
    telegram: String,
    instagram: String,
    github: String,
    education: String,
    specialization: String,
    workplace: String,
    experience: String,
    projects: String,
    achievements: String,
    isValid: Boolean,
    prediction: String,
    confidence: Number,
    status: String,
    humanDecision: String,
    reasonForDecision: String
});

const Candidate: Model<ICandidate> = mongoose.model<ICandidate>('Candidate', CandidateSchema);

// Classifier setup
let classifier = new Classifier({
    nGramMin: 1,
    nGramMax: 3,
    vocabulary: [],
});
const positiveData = ["React", "Vue", "Я хочу стать сильнее,", "хочу помогать стране, знаю фронт","Имею хорошие базовые навыки на уровне студента ИТ-университета"];
const negativeData = ["не особо знаю React ", "хочу деньги", "хочу разбоготеть,", "не знаю фронт", "знаю джанго"];

// Train the model
positiveData.forEach(data => classifier.train(data, 'хороший кандидат'));
negativeData.forEach(data => classifier.train(data, 'плохой кандидат'));
// Route to process data from /helloworld
router.post('/process-data', async (req, res) => {
    const { data } = req.body;
    let allPredictions: CandidatePrediction[] = [];

    // First pass: collect all predictions
    for (let row of data) {
        const candidate: CandidateInput = {
            category: row[0],
            telegram: row[1],
            instagram: row[2],
            github: row[3],
            education: row[4],
            specialization: row[5],
            workplace: row[6],
            experience: row[7],
            projects: row[8],
            achievements: row[9],
            isValid: row[10] === 'TRUE'
        };

        const text = `${candidate.category} ${candidate.experience} ${candidate.projects} ${candidate.achievements}`;
        const predictions = classifier.predict(text, 1, 0.1);

        if (predictions.length) {
            allPredictions.push({
                candidate,
                prediction: predictions[0] as PredictionResult
            });
        }
    }

    // Sort predictions by confidence in descending order
    allPredictions.sort((a, b) => b.prediction.confidence - a.prediction.confidence);

    // Find threshold values
    const totalCandidates = allPredictions.length;
    const approvedThreshold = Math.floor(totalCandidates * 0.3);
    const whitelistThreshold = Math.floor(totalCandidates * 0.7);

    // Second pass: categorize candidates and save to database
    for (let i = 0; i < allPredictions.length; i++) {
        const { candidate, prediction } = allPredictions[i];
        let status: string;

        if (i < approvedThreshold) {
            status = 'approved';
        } else if (i < whitelistThreshold) {
            status = 'whitelist';
        } else {
            status = 'rejected';
        }

        await Candidate.create({
            ...candidate,
            prediction: prediction.label,
            confidence: prediction.confidence,
            status
        });
    }

    res.json({ message: 'Predictions completed and saved' });
});

router.get('/candidates', async (req, res) => {
    const approved = await Candidate.find({ status: 'approved' });
    const whitelist = await Candidate.find({ status: 'whitelist' });
    const rejected = await Candidate.find({ status: 'rejected' });

    res.json({ approved, whitelist, rejected });
});

// Route to get whitelist candidates
router.get('/whitelist', async (req, res) => {
    const candidates = await Candidate.find({ status: 'whiteList' });
    console.log(`Whitelist candidates: ${JSON.stringify(candidates)}`);
    res.json(candidates);
});


// Route to update decision and train model
router.post('/decide', async (req, res) => {
    const { id, decision, reason } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(id, {
        status: decision,
        humanDecision: decision,
        reasonForDecision: reason
    });

    if (candidate) {
        const text = `${candidate.category} ${candidate.experience} ${candidate.projects} ${candidate.achievements}`;
        classifier.train(text, decision);
        res.json({ message: 'Decision saved and model updated' });
    } else {
        res.status(404).json({ message: 'Candidate not found' });
    }
});

// Route to reset model
router.post('/reset-model', (req, res) => {
    classifier = new Classifier({
        nGramMin: 1,
        nGramMax: 3,
        vocabulary: [],
    });
    res.json({ message: 'Model reset' });
});

export default router;
