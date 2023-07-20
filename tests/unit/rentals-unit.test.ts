import { RentalInput } from "protocols";
import rentalsRepository from "../../src/repositories/rentals-repository";
import rentalsService from "../../src/services/rentals-service";
import { pendentRentalError } from "../../src/errors/pendent-rental-error";
import usersRepository from "repositories/users-repository";


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
 
})

