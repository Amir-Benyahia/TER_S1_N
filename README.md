# 🎯 Maze Generation API with MongoDB Atlas

A full-stack maze generation application using Node.js, Python, and MongoDB Atlas cloud database.

## 👥 Membres du groupe
- Benyahia Amir
- Belhout Oussama
- Tamani Ahmed

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- MongoDB Atlas account (free tier)

### Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure MongoDB Atlas:**
   - Follow the guide in `QUICK_START.md` (10 minutes)
   - Create `.env` file with your MongoDB connection string

4. **Start the server:**
```bash
npm start
```

5. **Test the API:**
```
http://localhost:3000/api/generate?largeur=10&hauteur=8
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | ⚡ 10-minute setup guide |
| **[MONGODB_SETUP.md](MONGODB_SETUP.md)** | 📖 Detailed MongoDB Atlas setup |
| **[API_EXAMPLES.md](API_EXAMPLES.md)** | 💻 API usage examples |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ System architecture |
| **[MONGODB_INTEGRATION_SUMMARY.md](MONGODB_INTEGRATION_SUMMARY.md)** | 📦 Integration overview |
| **[ENV_TEMPLATE.txt](ENV_TEMPLATE.txt)** | 🔧 Environment config template |

---

## 🎯 Features

### Maze Generation
- ✅ Generate mazes using Kruskal's algorithm
- ✅ Customizable dimensions (3x3 to 50x50)
- ✅ Unicode box-drawing characters for display
- ✅ Fast Python-based generation

### Database Integration (NEW!)
- ✅ Save generated mazes to MongoDB Atlas
- ✅ Retrieve saved mazes with filtering
- ✅ Tag and name your mazes
- ✅ View usage statistics
- ✅ Delete old mazes
- ✅ User identification support

### API Features
- ✅ RESTful API design
- ✅ Input validation
- ✅ Error handling
- ✅ Metadata tracking
- ✅ Performance optimizations

---

## 🌐 API Endpoints

### Generate Maze
```
GET /api/generate?largeur=10&hauteur=8
```
Optional parameters: `save=true`, `name=MazeName`, `userId=user123`, `tags=tag1,tag2`

### List All Mazes
```
GET /api/mazes
```
Optional filters: `largeur`, `hauteur`, `userId`, `limit`

### Get Specific Maze
```
GET /api/mazes/:id
```

### Get Statistics
```
GET /api/stats
```

### Delete Maze
```
DELETE /api/mazes/:id
```

---

## 📦 Project Structure

```
TER_S1_N/
├── src/
│   ├── index.js                    # Main server entry
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── models/
│   │   └── Maze.js                 # Maze data model
│   ├── controllers/
│   │   └── generationController.js # Business logic
│   ├── routes/
│   │   └── mazeRoutes.js           # API routes
│   ├── services/
│   │   ├── pythonBridge.js         # Node-Python bridge
│   │   └── mazeGeneration/
│   │       ├── main.py             # Python CLI
│   │       ├── maze_generator.py   # Kruskal's algorithm
│   │       └── maze_visualiser.py  # Visualization
│   └── index.html                   # Frontend (if applicable)
├── .env                             # Environment variables (create this!)
├── .gitignore                       # Git ignore rules
├── package.json                     # Node.js dependencies
├── requirements.txt                 # Python dependencies
└── Documentation files (*.md)
```

---

## 🔧 Configuration

### Environment Variables (.env)
Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maze_database
PORT=3000
```

See `ENV_TEMPLATE.txt` for a complete template.

---

## 🧪 Testing

### Browser Testing
Simply paste these URLs in your browser:
```
http://localhost:3000/api/generate?largeur=10&hauteur=8
http://localhost:3000/api/generate?largeur=10&hauteur=8&save=true
http://localhost:3000/api/mazes
http://localhost:3000/api/stats
```

### PowerShell Testing
```powershell
Invoke-WebRequest "http://localhost:3000/api/generate?largeur=10&hauteur=8&save=true"
```

### JavaScript Testing
```javascript
fetch('http://localhost:3000/api/generate?largeur=10&hauteur=8&save=true')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🛠️ Technologies Used

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **ODM** | Mongoose |
| **Algorithm** | Python (Kruskal's) |
| **Config** | dotenv |
| **Visualization** | Matplotlib (Python) |

---

## 📊 Database Schema

```javascript
{
  _id: ObjectId,
  largeur: Number,           // Width (3-50)
  hauteur: Number,           // Height (3-50)
  labyrinthe: [[String]],    // 2D maze array
  nb_lignes: Number,         // Number of lines
  murs_restants: Number,     // Remaining walls
  name: String,              // Optional name
  userId: String,            // Optional user ID
  tags: [String],            // Optional tags
  generatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚦 Getting Started (Step by Step)

1. **Clone & Install**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Setup MongoDB Atlas**
   - Read `QUICK_START.md`
   - Create free cluster
   - Get connection string

3. **Configure Environment**
   - Copy `ENV_TEMPLATE.txt` to `.env`
   - Update with your MongoDB credentials

4. **Start Server**
   ```bash
   npm start
   ```

5. **Test It**
   ```
   http://localhost:3000/api/generate?largeur=10&hauteur=8&save=true
   ```

6. **View in Atlas**
   - Go to MongoDB Atlas dashboard
   - Browse Collections → `maze_database` → `mazes`

---

## 📈 Usage Examples

### Generate and Save Maze
```bash
GET /api/generate?largeur=15&hauteur=10&save=true&name=MyMaze&tags=medium,test
```

**Response:**
```json
{
  "largeur": 15,
  "hauteur": 10,
  "labyrinthe": [["╔", "═", ...], ...],
  "nb_lignes": 21,
  "murs_restants": 58,
  "saved": true,
  "id": "673c5f8e9a1234567890abcd"
}
```

### Retrieve Saved Mazes
```bash
GET /api/mazes?limit=10
```

**Response:**
```json
{
  "count": 5,
  "mazes": [
    {
      "id": "673c5f8e9a1234567890abcd",
      "dimensions": "15x10",
      "totalCells": 150,
      "wallsRemaining": 58,
      "generatedAt": "2024-11-07T10:30:00.000Z"
    }
  ]
}
```

---

## 🔐 Security

- ✅ Environment variables for credentials
- ✅ `.env` excluded from version control
- ✅ Input validation on all endpoints
- ✅ MongoDB injection protection (via Mongoose)
- ⚠️ Network access: Allow anywhere (development only)
- 🔒 For production: Use IP whitelisting and authentication

---

## ❌ Troubleshooting

### Server won't start
- Check if `.env` file exists
- Verify MongoDB connection string
- Ensure all dependencies installed: `npm install`

### Can't connect to MongoDB
- Check Network Access in Atlas (allow 0.0.0.0/0)
- Verify password in `.env` (no extra spaces)
- Wait 1-2 minutes after creating user

### Python errors
- Install Python dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (3.x required)

See `MONGODB_SETUP.md` for detailed troubleshooting.

---

## 📝 Development Notes

### Adding New Features
1. Update model in `src/models/Maze.js`
2. Add controller method in `src/controllers/generationController.js`
3. Add route in `src/routes/mazeRoutes.js`
4. Test endpoint
5. Update documentation

### Database Migrations
Mongoose handles schema changes automatically for non-breaking changes.

---

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Create frontend UI for saving/loading
- [ ] Implement maze solving algorithm
- [ ] Add sharing functionality
- [ ] Performance analytics dashboard
- [ ] Export mazes to PDF/PNG

---

## 📞 Support

For detailed setup help:
- **Quick Start**: See `QUICK_START.md`
- **API Usage**: See `API_EXAMPLES.md`
- **Architecture**: See `ARCHITECTURE.md`
- **MongoDB Issues**: See `MONGODB_SETUP.md`

MongoDB Resources:
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

## 📄 License

ISC

---

## ✅ Status

| Feature | Status |
|---------|--------|
| Maze Generation | ✅ Complete |
| MongoDB Integration | ✅ Complete |
| API Endpoints | ✅ Complete |
| Documentation | ✅ Complete |
| Frontend UI | 🔄 In Progress |

**Last Updated**: November 7, 2024  
**Version**: 1.0.0

---

## 🎉 Quick Commands

```bash
# Start server
npm start

# Generate maze (no save)
curl "http://localhost:3000/api/generate?largeur=10&hauteur=8"

# Generate and save
curl "http://localhost:3000/api/generate?largeur=10&hauteur=8&save=true"

# List all mazes
curl "http://localhost:3000/api/mazes"

# Get statistics
curl "http://localhost:3000/api/stats"
```

---

**Ready to get started? Follow [QUICK_START.md](QUICK_START.md) now!** 🚀
