import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import authRoutes from './routes/auth.routes';
import archivosRoutes from './routes/archivos.routes';
import coleccionesRoutes from './routes/colecciones.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static('src/uploads')
);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'API de FileVerseX funcionando correctamente'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/api/colecciones', coleccionesRoutes);
app.use('/api/admin', adminRoutes);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor FileVerseX ejecutándose en el puerto ${PORT}`
  );
});