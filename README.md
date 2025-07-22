<p align="center">
  <img src="https://img.icons8.com/color/96/000000/source-code.png" alt="Code Verse Logo" width="96"/>
</p>

# CODE VERSE 🚀

A full-stack coding platform for writing, running, saving, and managing code snippets in JavaScript and Java. Includes user authentication, code history, and profile management.

---

## ✨ Features
- 🔐 **User Registration & Login**: Secure authentication using JWT and bcrypt.
- 💻 **Code Execution**: Instantly run JavaScript and Java code with custom input.
- 📝 **Save & View Snippets**: Authenticated users can save code snippets and view their history.
- 👤 **Profile Management**: View and manage user profile details.
- ⚡ **Modern Frontend**: Built with React and Vite for a fast, responsive UI.
- 🗄️ **Backend API**: Node.js/Express server with MongoDB for data storage.
- 🌐 **RESTful API**: Well-documented endpoints for easy integration.
- 📊 **Execution Time**: See how fast your code runs!
- 🛡️ **Input Validation & Error Handling**: Robust checks for user data and code execution.

## 🛠️ Technologies Used

| Frontend | Backend | Database | Auth |
|----------|--------|----------|------|
| <img src="https://img.icons8.com/color/48/000000/react-native.png" width="24"/> React | <img src="https://img.icons8.com/color/48/000000/nodejs.png" width="24"/> Node.js | <img src="https://img.icons8.com/color/48/000000/mongodb.png" width="24"/> MongoDB | <img src="https://img.icons8.com/color/48/000000/key-security.png" width="24"/> JWT, bcrypt |
| <img src="https://img.icons8.com/color/48/000000/vite.png" width="24"/> Vite | <img src="https://img.icons8.com/color/48/000000/express.png" width="24"/> Express | <img src="https://img.icons8.com/color/48/000000/mongoose.png" width="24"/> Mongoose | |

## 🏁 Getting Started

### 📋 Prerequisites
- <img src="https://img.icons8.com/color/48/000000/nodejs.png" width="20"/> Node.js & npm
- <img src="https://img.icons8.com/color/48/000000/mongodb.png" width="20"/> MongoDB (local or Atlas)

### ⚙️ Setup
1. **Clone the repository**
   ```powershell
   git clone <repo-url>
   cd "CODE VERSE"
   ```
2. **Install dependencies**
   ```powershell
   cd backend; npm install
   cd ../frontend; npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file in `backend/`:
     ```env
     MONGO_URI=mongodb://localhost:27017/coding-platform
     JWT_SECRET=your_jwt_secret
     ```
4. **Start the backend server**
   ```powershell
   cd ../backend; node server.js
   ```
5. **Start the frontend**
   ```powershell
   cd ../frontend; npm run dev
   ```
6. **Access the app**
   - 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
   - 🛠️ Backend API: [http://localhost:5000](http://localhost:5000)

## 📚 API Endpoints

| Method | Endpoint         | Description                       | Auth Required |
|--------|------------------|-----------------------------------|:------------:|
| POST   | `/register`      | Register a new user               | ❌           |
| POST   | `/login`         | Login and get JWT                 | ❌           |
| POST   | `/save-code`     | Save a code snippet               | ✅           |
| GET    | `/history`       | Get user's code history           | ✅           |
| GET    | `/profile`       | Get user profile                  | ✅           |
| POST   | `/run`           | Run code (JavaScript/Java)        | ❌           |

## 📁 Folder Structure
```
CODE VERSE/
├── backend/    # Express server, MongoDB models, API routes
│   ├── server.js
│   ├── ...
├── frontend/   # React app, Vite config, UI components
│   ├── src/
│   ├── ...
├── package.json
```

## 📝 License
MIT

## 👤 Author
[krishyadav90](https://github.com/krishyadav90)

---

<p align="center">
  <img src="https://img.icons8.com/color/48/000000/rocket.png" width="32"/> Happy Coding! <img src="https://img.icons8.com/color/48/000000/keyboard.png" width="32"/>
</p>
