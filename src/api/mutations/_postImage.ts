import { apiFetch } from "..";

export type PostResponse = {
	players: { hole_cards: Record<string, string>[] | null; username: string }[];
	results: { winner: string }[];
	hand_id: string;
	total_pot: number;
	turn: Record<string, string>;
	river: Record<string, string>;
	buy_in: number;
	gtoScore: number;
	flop: Record<string, string>[];
};

export async function _postImage({
	binaryData,
	contentType,
}: {
	binaryData: ArrayBuffer;
	contentType: string;
}) {
	return apiFetch("/image", {
		method: "POST",
		body: binaryData,
		headers: {
			"Content-Type": contentType,
		},
	});
}

export const getInfoFromHand = (data: PostResponse) => {
	const currentPlayer = data?.players?.filter((player) => player.hole_cards)?.[0];

	const isWinner = data?.results?.[0]?.winner === currentPlayer?.username;

	return {
		id: data?.hand_id,
		currentPlayer: currentPlayer?.hole_cards,
		totalPot: data?.total_pot,
		isWinner,
		flop: [...(data?.flop ?? []), data?.turn, data?.river],
		gtoScore: Math.floor(Math.random() * 100) + 1,
		buyIn: data?.buy_in,
	};
};
