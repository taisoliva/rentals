import { RentalInput } from "protocols";
import rentalsRepository from "../../src/repositories/rentals-repository";
import rentalsService from "../../src/services/rentals-service";
import { pendentRentalError } from "../../src/errors/pendent-rental-error";
import usersRepository from "repositories/users-repository";
import moviesRepository from "repositories/movies-repository";
import { ApplicationError, handleApplicationErrors } from "middlewares/error-handler";
import { Response, NextFunction, request, response } from "express";
import httpStatus from "http-status";


describe("Rentals Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return rentals", async () => {
    jest.spyOn(rentalsRepository, "getRentals").mockResolvedValueOnce([
      { id: 1, closed: false, date: new Date(), endDate: new Date(), userId: 1 },
	    { id: 2, closed: false, date: new Date(), endDate: new Date(), userId: 1 }
    ]);

    const rentals = await rentalsService.getRentals();
	  expect(rentals).toHaveLength(2);
  });

  it("should throw an error if user already has a rental", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }

    const mockUser = {
      id: 1,
      firstName: "Tais",
      lastName: "Carvalho",
      cpf: "17141877714",
      birthDate: new Date("2000-01-01"),
      email: "tais@gmail.com",
    };

   
    jest.spyOn(usersRepository, "getById").mockResolvedValueOnce(mockUser)

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockResolvedValueOnce([
      { id: 1, closed: false, date: new Date(), endDate: new Date(), userId: 1 }
    ])

    await expect(rentalsService.createRental(rentalInput)).rejects.toEqual({
      message: "The user already have a rental!",
      name: "PendentRentalError"
    });
   
  })

  it("should throw an error if movie not found.", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }

    const mockUser = {
      id: 1,
      firstName: "Tais",
      lastName: "Carvalho",
      cpf: "17141877714",
      birthDate: new Date("2000-01-01"),
      email: "tais@gmail.com",
    };

    jest.spyOn(usersRepository, "getById").mockResolvedValueOnce(mockUser)

    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return undefined
    })

   await expect(rentalsService.createRental(rentalInput)).rejects.toEqual({
      message: "Movie not found.",
      name: "NotFoundError"
    })
   
  })

  it("should throw an error if movie already in a rental.", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }

    const mockUser = {
      id: 1,
      firstName: "Tais",
      lastName: "Carvalho",
      cpf: "17141877714",
      birthDate: new Date("2000-01-01"),
      email: "tais@gmail.com",
    };

    jest.spyOn(usersRepository, "getById").mockResolvedValueOnce(mockUser)

    jest.spyOn(moviesRepository, "getById").mockResolvedValueOnce({
      id: 1,
      name:"Procurando Nemo",
      adultsOnly: false,
      rentalId: 2
    })

   await expect(rentalsService.createRental(rentalInput)).rejects.toEqual({
      message: "Movie already in a rental.",
      name: "MovieInRentalError"
    })
   
  })

  it("should throw an error if cannot see that movie.", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }

    const mockUser = {
      id: 1,
      firstName: "Tais",
      lastName: "Carvalho",
      cpf: "17141877714",
      birthDate: new Date("2010-01-01"),
      email: "tais@gmail.com",
    };

    jest.spyOn(usersRepository, "getById").mockResolvedValueOnce(mockUser)

    jest.spyOn(moviesRepository, "getById").mockResolvedValueOnce({
      id: 1,
      name:"Filme Adulto",
      adultsOnly: true,
      rentalId: null
    })

   await expect(rentalsService.createRental(rentalInput)).rejects.toEqual({
      message: "Cannot see that movie.",
      name: "InsufficientAgeError"
    })
   
  })

  it("should throw an error if rental not found", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }

    const mockUser = {
      id: 1,
      firstName: "Tais",
      lastName: "Carvalho",
      cpf: "17141877714",
      birthDate: new Date("2010-01-01"),
      email: "tais@gmail.com",
    };

    jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
      return undefined
    })

    await expect(rentalsService.getRentalById(2)).rejects.toEqual({
      message: "Rental not found.",
      name: "NotFoundError"
    })
  })

  it("should throw an error if user not found", async () => {

    const rentalInput: RentalInput = {
      userId:1,
      moviesId: [1]
    }


    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return undefined
    })

    await expect(rentalsService.createRental(rentalInput)).rejects.toEqual({
      message: "User not found.",
      name: "NotFoundError"
    })
  })
 
})


