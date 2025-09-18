import { Hand, HandHistory as HandHistoryType } from "./HandHistory";
import { motion } from "motion/react";

type HandPopupProps = {
	data: HandHistoryType;
	handleClose: () => void;
};

export function HandPopup(props: HandPopupProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="p-5 border border-[#4B4B4B] bg-[#232323fe] rounded-lg relative backdrop-blur-lg"
		>
			<div className="absolute size-6 rotate-45 top-0 right-0 translate-y-[-50%] bg-[#232323] -translate-x-[150%] z-0"></div>
			<Hand
				// userCards={props.data.userCards}
				// flop={props.data.flop}
				// score={props.data.score}
				// amount={props.data.amount}
				// win={props.data.win}
				userCards={[
					{ suit: "hearts", rank: "A" },
					{ suit: "hearts", rank: "K" },
				]}
				flop={[
					{ suit: "hearts", rank: "Q" },
					{ suit: "hearts", rank: "J" },
					{ suit: "hearts", rank: "10" },
				]}
				score={80}
				amount={100}
				win={true}
			/>
		</motion.div>
	);
}
