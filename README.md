📊 Student Help Desk Portal (MERN Stack)
A full-stack support ticket management system built with the MERN stack (MongoDB, Express, React, Node.js). This platform allows students to submit technical or academic queries and enables administrators to manage and resolve those requests in real-time.

Shutterstock

✨ Features
🔐 Security & Authentication
JWT Authentication: Secure login and registration using JSON Web Tokens.

Protected Routes: Frontend and Backend guards to prevent unauthorized access.

Role-Based Access (RBAC): Distinct dashboards for Students and Admins.

Password Hashing: Industry-standard encryption using bcryptjs.

Ownership Verification: Students can only view and delete their own tickets; they cannot interfere with others' data.

👨‍🎓 Student Features
Create support tickets with a title and description.

View a personal history of submitted tickets.

Track the status of requests (Open/Resolved).

Delete personal tickets.

🛠 Admin Features
Global dashboard to view all tickets from all students.

Update ticket status to "Resolved" with one click.

Delete any ticket from the system.

🎨 UI/UX
Responsive Design: Fully functional on mobile, tablet, and desktop.

Smooth Animations: Powered by Framer Motion.

Modern Icons: Integrated with Lucide-React.

🚀 Tech Stack
Technology	Usage
MongoDB	NoSQL Database for storing users and tickets
Express.js	Backend web framework
React.js	Frontend library for the user interface
Node.js	JavaScript runtime environment
Axios	Handling API requests
Framer Motion	UI animations
JSON Web Token	Secure authentication
🛠️ Installation & Setup
1. Clone the repository
Bash
cd student-help-desk
2. Backend Setup
Navigate to the server folder: cd server

Install dependencies: npm install

Create a .env file in the server directory and add:

Code snippet
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
Start the server: npm start (or npm run dev if using nodemon)

3. Frontend Setup
Navigate to the client folder: cd ../client

Install dependencies: npm install

Start the React app: npm start

🛡️ API Endpoints
Method	Endpoint	Access	Description
POST	/auth/register	Public	Register a new user
POST	/auth/login	Public	Authenticate user & get token
GET	/tickets	Private	Fetch tickets (Filtered by Role)
POST	/createTicket	Student	Create a new support request
DELETE	/tickets/:id	Owner/Admin	Delete a specific ticket
PUT	/tickets/:id/resolve	Admin	Mark a ticket as resolved


📜 License
Distributed under the MIT License. See LICENSE for more information.


