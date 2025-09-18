import { ofetch } from "ofetch";

export const apiFetch = ofetch.create({
	baseURL: "https://hand-histories-api-17d9197c8553.herokuapp.com",
});
