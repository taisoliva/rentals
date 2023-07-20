import supertest from "supertest"
import app from "../../src/app"
import { cleanDb } from "../utils"
import { buildUser } from "../factories/user-factory"
import { buildMovie } from "../factories/movie-factory"
import { buildRental, rentMovie } from "../factories/rental-factory"
import httpStatus from "http-status"
import { RentalFinishInput, RentalInput } from "protocols"


const api = supertest(app)

beforeEach(async () => {
  await cleanDb()
})

describe("GET /rentals", () => {

  it("should return all rentals", async () => {
    const user = await buildUser()
    const movie = await buildMovie()
    const rental = await buildRental(user.id)
    await rentMovie(rental.id, movie.id)

    const { status, body } = await api.get("/rentals")

    expect(status).toBe(httpStatus.OK)
    expect(body).toEqual([{
      id: rental.id,
      date: expect.any(String),
      endDate: expect.any(String),
      userId: user.id,
      closed: false
    }])
  })
})

describe("GET /rentals/:id", () => {
  it("should return a rental", async () => {

    const user = await buildUser()
    const movie = await buildMovie()
    const rental = await buildRental(user.id)

    await rentMovie(rental.id, movie.id)

    const { status, body } = await api.get(`/rentals/${rental.id}`)
    expect(status).toBe(httpStatus.OK)
    expect(body).toEqual({
      id: rental.id,
      date: expect.any(String),
      endDate: expect.any(String),
      userId: user.id,
      closed: false
    })
  })

  it("should return 400 when id is invalid", async () => {
    const { status } = await api.get("/rentals/invalid")
    expect(status).toBe(httpStatus.BAD_REQUEST)
  })

  it("should return 404 when id is not found", async () => {
    const { status } = await api.get("/rentals/1")
    expect(status).toBe(httpStatus.NOT_FOUND)
  })
})

describe("POST /rentals", () => {
  it("should return a successfull rental", async () => {
    const user = await buildUser()
    const movie = await buildMovie()

    const rental: RentalInput = {
      userId: user.id,
      moviesId: [movie.id]
    }

    const {status} = await api.post("/rentals").send(rental)
    expect(status).toBe(httpStatus.CREATED)
  })

  it("should return 401 when a minor user tries to rental a movie that is adults only", async () => {
    const user = await buildUser(false)
    const movie = await buildMovie(true)

    const rental : RentalInput = {
      userId: user.id,
      moviesId: [movie.id]
    }

    const {status} = await api.post("/rentals").send(rental)
    expect(status).toBe(httpStatus.UNAUTHORIZED)
  })

  it("should return 409 when user tries to rent a movie that is already in another rental", async () => {
    const user = await buildUser()
    const movie = await buildMovie()
    const rental = await buildRental(user.id)
    await rentMovie(rental.id, movie.id)

    const anotherUser = await buildUser()
    const rentalAttempt : RentalInput = {
      userId: anotherUser.id,
      moviesId: [movie.id]
    }

    const {status} = await api.post("/rentals").send(rentalAttempt)
    expect(status).toBe(httpStatus.CONFLICT)
  })

  it("should return 402 when user already have a rental to return", async () => {
    const user = await buildUser()
    const movie = await buildMovie()
    const rental = await buildRental(user.id)
    await rentMovie(rental.id, movie.id);

    const otherMovie = await buildMovie()
    const rentalAttempt : RentalInput = {
      userId: user.id,
      moviesId: [otherMovie.id]
    }

    const {status} = await api.post("/rentals").send(rentalAttempt)
    expect(status).toBe(httpStatus.PAYMENT_REQUIRED)
  })

  it("should return 422 when data is missing", async () => {
    type RentalInputMissingData = Omit<RentalInput, "moviesId">;
    const rental: RentalInputMissingData = {
      userId: 1
    }

    const { status } = await api.post(`/rentals`).send(rental);
    expect(status).toBe(422);
  });

  it("should return 422 when data is missing", async () => {
    type RentalInputMissingData = Omit<RentalInput, "moviesId">;
    const rental: RentalInputMissingData = {
      userId: 1
    }

    const { status } = await api.post(`/rentals`).send(rental);
    expect(status).toBe(422);
  });

  it("should return 404 when id user does not exist", async () => {
    const movie = await buildMovie(true);
    const rental: RentalInput = {
      userId: 1, // made up user id
      moviesId: [movie.id]
    };

    const { status } = await api.post(`/rentals`).send(rental);
    expect(status).toBe(404);
  });

  it("should return 404 when movie does not exist", async () => {
    const user = await buildUser();
    const rental: RentalInput = {
      userId: user.id,
      moviesId: [1] // // made up movie id
    };

    const { status } = await api.post(`/rentals`).send(rental);
    expect(status).toBe(404);
  })
})

describe("POST /rentals/finish", () => {
  it("should return 422 when data is missing", async () => {
    const { status } = await api.post(`/rentals/finish`).send({});
    expect(status).toBe(422);
  });

  it("should finalize a valid rental", async () => {
    const user = await buildUser();
    const movie1 = await buildMovie();
    const movie2 = await buildMovie();
    const rental = await buildRental(user.id);

    await rentMovie(rental.id, movie1.id);
    await rentMovie(rental.id, movie2.id);

    const data: RentalFinishInput = {
      rentalId: rental.id
    };

    const { status } = await api.post(`/rentals/finish`).send(data);
    expect(status).toBe(httpStatus.OK);
  });

  it("should return 404 when rental does not exist", async () => {
    const data: RentalFinishInput = {
      rentalId: 1
    };

    const { status } = await api.post(`/rentals/finish`).send(data);
    expect(status).toBe(404);
  })
})