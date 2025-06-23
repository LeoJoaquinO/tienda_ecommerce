import type { Product } from './types';

const products: Product[] = [
  {
    id: '1',
    name: 'Vela Aromática de Soja',
    description: 'Vela artesanal de cera de soja con fragancia a lavanda y romero. Perfecta para crear un ambiente relajante.',
    price: 3500,
    salePrice: 2990,
    image: 'https://placehold.co/600x600',
    aiHint: 'scented candle',
    category: 'Hogar',
    stock: 25,
    featured: true,
  },
  {
    id: '2',
    name: 'Taza de Cerámica Hecha a Mano',
    description: 'Taza de cerámica con un diseño único pintado a mano. Ideal para tu café de la mañana.',
    price: 4200,
    image: 'https://placehold.co/600x600',
    aiHint: 'ceramic mug',
    category: 'Cocina',
    stock: 15,
    featured: true,
  },
  {
    id: '3',
    name: 'Cuaderno de Tapa Dura "Ideas"',
    description: 'Un cuaderno elegante con 100 hojas punteadas para que anotes todas tus ideas. Tapa dura y cierre elástico.',
    price: 2800,
    image: 'https://placehold.co/600x600',
    aiHint: 'hardcover notebook',
    category: 'Papelería',
    stock: 40,
    featured: true,
  },
  {
    id: '4',
    name: 'Maceta de Terracota Minimalista',
    description: 'Dale un toque de naturaleza a tu espacio con esta maceta de diseño simple y elegante.',
    price: 3900,
    salePrice: 3500,
    image: 'https://placehold.co/600x600',
    aiHint: 'plant pot',
    category: 'Hogar',
    stock: 20,
  },
  {
    id: '5',
    name: 'Bolsa de Tela "Eco-Friendly"',
    description: 'Bolsa de tela reutilizable con un diseño moderno. Ayuda al planeta con estilo.',
    price: 2500,
    image: 'https://placehold.co/600x600',
    aiHint: 'tote bag',
    category: 'Accesorios',
    stock: 50,
  },
  {
    id: '6',
    name: 'Set de Posavasos de Madera',
    description: 'Protege tus superficies con este set de 4 posavasos de madera de acacia.',
    price: 3100,
    image: 'https://placehold.co/600x600',
    aiHint: 'wood coasters',
    category: 'Cocina',
    stock: 18,
  },
  {
    id: '7',
    name: 'Lámina Decorativa "Abstracto"',
    description: 'Lámina para enmarcar con una composición abstracta en tonos cálidos. Medidas: 30x40cm.',
    price: 2200,
    salePrice: 1900,
    image: 'https://placehold.co/600x600',
    aiHint: 'abstract art',
    category: 'Decoración',
    stock: 30,
  },
  {
    id: '8',
    name: 'Infusor de Té de Acero Inoxidable',
    description: 'Disfruta de tu té en hebras favorito con este práctico y duradero infusor de acero.',
    price: 1800,
    image: 'https://placehold.co/600x600',
    aiHint: 'tea infuser',
    category: 'Cocina',
    stock: 28,
  },
];

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
