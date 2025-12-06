import { IFieldImage } from "./ifield-image";

export interface IField {


      id: number
      name: string
      location: string,

      pricePerHour: number,
      size: string,
      openAt: number,
      closeAt: number,
      balance: number,

      isApproved: boolean,
      categoryName: string,
      cityName: string,
      ownerName: string,
      ownerUserName: string,
      fieldImages: IFieldImage[];
    }

