import bcrypt from "bcryptjs"

const users = [ 
    {
        name:"Long Vo",
        role:"Admin",
        surole:"Manager",
        email:"longvo010203@gmail.com",
        phone:"0902595237",
        birthday:"17/01/2003",
        password:bcrypt.hashSync("admin123",10),
        isAdmin:true,
    },
    {
        name:"Kiku",
        role:"Admin",
        email:"2702kikuhonda@gmail.com",
        phone:"0778723102",
        birthday:"17/01/2003",
        isAdmin:true,
        password:bcrypt.hashSync("1234567",10),
        
    }
];
export default users;