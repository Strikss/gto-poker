import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "..";

type Hand = {
	userCards: Record<string, string>[];
	flop: Record<string, string>[];
	score: number;
	win: boolean;
	amount: number;
};

function _getHands() {
	return apiFetch("/hands");
}

function useGetHands() {
	return useQuery({
		queryKey: ["hands"],
		queryFn: _getHands,
	});
}

export { _getHands, useGetHands };
