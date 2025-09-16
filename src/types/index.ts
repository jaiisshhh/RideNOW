// This file defines the data structures, or "types," for your app. It tells your code what a Vehicle object should look like (it must have an id, name, price, etc.). This helps prevent bugs.

export interface Vehicle {
id: number;
name: string;
price: string;
image: any;
}


export interface DateTimeSelection {
date: string;
time: string;
}