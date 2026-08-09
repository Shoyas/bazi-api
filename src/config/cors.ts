const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://72.62.87.243:3001',
    'https://www.skillquix.tech',
    'https://dev.skillquix.tech',
    'http://localhost:3333',
    'http://206.162.244.134:3333',
    'https://csuja-nandor.vercel.app',
    'https://csuja-nandor.netlify.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export default corsOptions;
