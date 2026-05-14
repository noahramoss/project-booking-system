import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const createHotel = async (req, res, next) => {
  try {
    const { name, city, country, stars, description } = req.body;

    const manager = req.user.id;

    const newHotel = await prisma.hotel.create({
      data: {
        ...req.body,
        managerId: manager,
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        stars: true,
        description: true,
        //Navegamos a la tabla de manager y sacamos su nombre
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Hotel creado con éxito",
      hotel: newHotel,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllHotels = async (req, res, next) => {
  try {
    const { name, city, country, stars, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const where = {};

    if (name) where.name = { contains: name, mode: "insensitive" };
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (stars) where.stars = parseInt(stars);

    const totalHotels = await prisma.hotel.count({ where: where });

    const hotels = await prisma.hotel.findMany({
      where: where,
      skip: skip,
      take: limitNumber,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        stars: true,
        description: true,
        //Navegamos a la tabla de manager y sacamos su nombre
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      results: hotels.length,
      pagination: {
        totalRecords: totalHotels,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalHotels / limitNumber),
      },
      hotels: hotels,
    });
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        stars: true,
        description: true,
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!hotel) {
      return next(new AppError("Hotel no encontrado", 404));
    }

    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existsHotel = await prisma.hotel.findUnique({ where: { id } });
    if (!existsHotel) {
      return next(new AppError("Hotel no encontrado", 404));
    }

    // Validar autorización: Solo el dueño o un Admin pueden eliminar
    if (req.user.role === "MANAGER" && existsHotel.managerId !== req.user.id) {
      return next(
        new AppError(
          "No tienes permiso para realizar esta acción en este hotel",
          403,
        ),
      );
    }

    const hotel = await prisma.hotel.update({
      where: { id },
      data: { ...req.body },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        stars: true,
        description: true,
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Hotel actualizado",
      hotel: hotel,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existsHotel = await prisma.hotel.findUnique({ where: { id } });
    if (!existsHotel) {
      return next(new AppError("Hotel no encontrado", 404));
    }

    // Validar autorización: Solo el dueño o un Admin pueden eliminar
    if (req.user.role === "MANAGER" && existsHotel.managerId !== req.user.id) {
      return next(
        new AppError(
          "No tienes permiso para realizar esta acción en este hotel",
          403,
        ),
      );
    }

    const hotel = await prisma.hotel.delete({
      where: { id },
    });
    res.status(200).json({ message: "Hotel eliminado con éxito" });
  } catch (error) {
    next(error);
  }
};
