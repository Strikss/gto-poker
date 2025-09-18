"use client";

import { useGetHands } from "@/api/queries/_getHands";
import Icons from "@/icons";
import { motion, AnimatePresence } from "motion/react";

interface HandHistoryProps {
	open: boolean;
	handleClose: () => void;
}

function HandHistory({ open, handleClose }: HandHistoryProps) {
	const { data } = useGetHands();

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/50 z-40"
						onClick={handleClose}
					/>

					{/* Dialog */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 300,
							duration: 0.3,
						}}
						className="fixed right-0 top-0 h-full w-96 bg-[#23232380] backdrop-blur-lg shadow-xl z-50 flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4">
							<h2 className="text-lg font-semibold">Hand History</h2>
							<button
								onClick={handleClose}
								className="p-1 hover:bg-white/10 rounded-full transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 p-4 overflow-y-auto">
							<div className="text-gray-600">
								<Hand
									userCards={userCards}
									flop={flop}
									score={score}
									amount={amount}
									win={win}
								/>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

export type HandHistory = {
	userCards: Record<string, string>[];
	flop: Record<string, string>[];
	score: number;
	win: boolean;
	amount: number;
};

export function Hand({ userCards, flop, score, amount, win }: HandHistory) {
	return (
		<div>
			<div className="flex mb-2">
				<div className="flex gap-1 mr-8">
					{userCards.map((card) => (
						<Card suit={card.suit} rank={card.rank} key={"USER_" + card.suit + card.rank} />
					))}
					<Card suit="spades" rank="A" />
					<Card suit="hearts" rank="K" />
				</div>
				<div className="flex gap-1">
					{flop.map((card) => (
						<Card suit={card.suit} rank={card.rank} key={card.suit + card.rank} />
					))}
				</div>
			</div>
			<div className="text-white/50">
				<p>
					Excellent, <span className="font-bold text-white/70">${amount}</span>{" "}
					<span>{win ? "won" : "lost"}</span>
				</p>
				<p>
					GTO Score <span className="font-bold text-white/70">{score}%</span>
				</p>
			</div>
		</div>
	);
}
const SuitToIcon = {
	spades: Icons.spades,
	hearts: Icons.hearts,
	clubs: Icons.clubs,
	diamonds: Icons.diamonds,
};

function Card({ suit, rank }: { suit: string; rank: string }) {
	const SuitIcon = SuitToIcon[suit as keyof typeof SuitToIcon];
	return (
		<div
			className="p-1.5 w-fit rounded-sm"
			style={{ background: "linear-gradient(180deg, #FFF 0%, #F0F0F0 100%)" }}
		>
			<span className="font-bold text-lg text-black">{rank}</span>
			<SuitIcon className="size-[18px] ml-1" />
		</div>
	);
}

export default HandHistory;
