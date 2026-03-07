import db from '../db.js';

export const addSport = async (req, res) => {
    const {name} = req.body;
    const userID = req.user.id;
    try {
        const [test] = await db.query('SELECT sport_name FROM sports WHERE sport_name=?',[name])
        if(test.length > 0){
            res.status(500).json({ message: 'Sport Already Exist' });
        }else{
        const [result] = await db.query('INSERT INTO sports (sport_name,user_id) VALUES (?,?)', [name, userID]);
        res.status(201).json({ message: 'Sport added successfully', sportId: result.insertId });}
    } catch (error) {
        console.error('Error adding sport:', error);
        res.status(500).json({ message: 'Failed to add sport' });
    }};

export const getSports = async (req, res) => {
    const userID = req.user.id;
    try {
        const [sports] = await db.query('SELECT * FROM sports WHERE user_id = ?', [userID] );
        res.status(200).json(sports);
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ message: 'Failed to fetch sports' });
    }
};