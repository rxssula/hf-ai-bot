import express from 'express';
import Classifier from 'ml-classify-text';

const router = express.Router();

// Create a new classifier with more advanced configuration
const classifier = new Classifier({
    nGramMin: 1,
    nGramMax: 3,  // Use unigrams, bigrams, and trigrams
    vocabulary: [],  // Use an empty array instead of an empty Set
});

const positiveData = [    "React","Vue","Я хочу стать сильнее,","хочу помогать стране, знаю фронт"];

const negativeData = [    "не особо знаю React ","хочу деньги","хочу разбоготеть,","не знаю фронт","знаю джанго"];


// Train the model
classifier.train(positiveData, 'хороший кандидат');
classifier.train(negativeData, 'плохой кандидат');

// The rest of the code remains the same...

// Route for prediction
router.post('/predict', (req, res) => {
    // const { text } = req.body;
    const text  = "Проходил курс по фронтенд разработке, и базовые курсы по пайтону. Знаю html, css. Js и React на начальном уровне";


    if (!text) {
        return res.status(400).json({ error: 'Текст не предоставлен' });
    }

    console.log('Текст кандидата:', text);

    // Make prediction with more parameters
    const predictions = classifier.predict(text, 3, 0.1);

    console.log('Предсказания:', predictions);

    if (predictions.length) {
        // Return more detailed prediction information
        const detailedPredictions = predictions.map(prediction => ({
            label: prediction.label,
            confidence: prediction.confidence,
            tokens: classifier.tokenize(text)
        }));
        res.json(detailedPredictions);
    } else {
        res.json({ message: 'Нет предсказаний' });
    }
});

// Add a route to get model information
router.get('/model-info', (req, res) => {
    const modelInfo = {
        nGramMin: classifier.model.nGramMin,
        nGramMax: classifier.model.nGramMax,
        vocabularySize: classifier.model.vocabulary ? classifier.model.vocabulary.size : 'N/A',
        labels: Object.keys(classifier.model.data)
    };
    res.json(modelInfo);
});

// Add a route to add new training data
router.post('/train', (req, res) => {
    const { text, label } = req.body;

    if (!text || !label) {
        return res.status(400).json({ error: 'Текст и метка должны быть предоставлены' });
    }

    classifier.train(text, label);
    res.json({ message: 'Модель обучена на новых данных' });
});

export default router;
