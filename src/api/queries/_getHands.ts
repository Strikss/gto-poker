import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "..";

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
