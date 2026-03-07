import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    return jwt.sign({
        id : user.user_id,
        email : user.email
    },
    "19200525", 
    { 
        expiresIn: "7d"
     });

}