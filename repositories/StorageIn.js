import moment from "moment";
import promiseAsyncWrapper from "../middlewares/promise_async_wrapper.js";
import PrismaClientService from "../utils/prisma_client.js";
import DateTimeRepository from "./Date.js";
import Randomstring from "randomstring"

class StorageInRepository {
    static prisma = PrismaClientService.instance

    /**
     * 
     * @param {string?} other_date 
     * @returns 
     */
    static getAllStorageIns = async (other_date) => new Promise(
        promiseAsyncWrapper(
            async (resolve, reject) => {
                const storageIns = await this.prisma.storageIn.findMany({
                    include: {
                        flour: true
                    },
                    where: {
                        created_at: {
                            startsWith: other_date != null ? other_date : moment().format("DD-MM-YYYY")
                        }
                    }
                })
                return resolve(storageIns)
            }
        )
    )

    static getStorageInsByFlourType = async ({ flour_id }) => new Promise(
        promiseAsyncWrapper(
            async (resolve, reject) => {
                const storageIns = await this.prisma.storageIn.findMany({
                    where: {
                        flour_id: +flour_id
                    }
                })
                return resolve(storageIns)
            }
        )
    )

    static createStorageIn = async ({ stock, flour_id, unit_purchase_price }) => new Promise(
        promiseAsyncWrapper(
            async (resolve, reject) => {
                const createdStorageIn = await this.prisma.storageIn.create({
                    data: {
                        stock: +stock,
                        flour_id: +flour_id,
                        unit_purchase_price: +unit_purchase_price,
                        total_purchase_price: +stock * +unit_purchase_price,
                        created_at: DateTimeRepository.getCurrentDate(),
                        flour_package: {
                            create: {
                                stock: +stock,
                                package_number: +Randomstring.generate({
                                    length: 12,
                                    charset: "numeric"
                                }),
                                flour_id: +flour_id,
                                unit_purchase_price: +unit_purchase_price,
                                created_at: DateTimeRepository.getCurrentDate()
                            }
                        }
                    }
                })

                const updatedFlour = await this.prisma.flour.update({
                    where: {
                        id: +flour_id
                    },
                    data: {
                        stock: {
                            increment: +stock
                        }
                    }
                })
                return resolve({
                    storage_in_id: createdStorageIn,
                    flour: updatedFlour
                })
            }
        )
    )
}

export default StorageInRepository