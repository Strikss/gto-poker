import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "..";
import { PostResponse } from "../mutations/_postImage";

type Hand = {
	data: PostResponse & { small_blind: number };
	id: string;
};

async function _getHands() {
	const data = await apiFetch<Hand[]>("/hands");
	const filtered = data?.filter((el) => !!el.data.small_blind);
	const mapped = filtered?.map((el) => ({
		...el.data,
		gtoScore: Math.floor(Math.random() * 100) + 1,
	}));

	return mapped?.reverse();
}

function useGetHands() {
	return useQuery({
		queryKey: ["hands"],
		queryFn: _getHands,
	});
}

export { _getHands, useGetHands };
