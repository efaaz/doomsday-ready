import * as cinemaService from "../services/cinema.service.js";

// 1. CREATE CINEMA

export const createCinema = async (req, res, next) => {
  try {
    const cinema = await cinemaService.createCinema(req.body);

    res.status(201).json({
      success: true,
      message: "Cinema created successfully",
      data: cinema,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL CINEMAS


export const getCinemas = async (req, res, next) => {
  try {
    const cinemas = await cinemaService.getCinemas();

    res.status(200).json({
      success: true,
      count: cinemas.length,
      data: cinemas,
    });
  } catch (error) {
    next(error);
  }
};


// 3. GET BOOKING QUOTE

export const getBookingQuote = async (req, res, next) => {
  try {
    const quote = await cinemaService.getBookingQuote(
      req.params.id,
      req.query.groupSize,
    );

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};
