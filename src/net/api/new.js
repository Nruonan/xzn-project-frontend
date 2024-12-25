import {get} from "@/net/index.js";

export const apiNewList = (success) =>
  get('/api/new/list',success)