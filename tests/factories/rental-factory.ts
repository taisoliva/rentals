import { Rental } from "@prisma/client";
import prisma from "database";
import { RENTAL_LIMITATIONS } from "services/rentals-service";


type RentalInput = Omit <Rental, "id">

export function buildRental(userId : number){

    const data = buildRentalInput(userId)
    return prisma.rental.create({data})

}

export function buildRentalInput(userId: number) {
    return {
      userId,
      endDate: new Date(new Date().getDate() + RENTAL_LIMITATIONS.RENTAL_DAYS_LIMIT)
    }
}

  export async function rentMovie(rentalId: number, movieId: number) {
    await prisma.movie.update({
      data: { rentalId },
      where: { id: movieId }
    })
  }