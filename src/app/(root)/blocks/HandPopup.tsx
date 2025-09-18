import { getInfoFromHand, PostResponse } from "@/api/mutations/_postImage";
import { Hand } from "./HandHistory";
import { motion } from "motion/react";
import { useEffect } from "react";
import Icons from "@/icons";

type HandPopupProps = {
	data: PostResponse & { data: PostResponse };
	handleClose: () => void;
};

export function HandPopup(props: HandPopupProps) {
	const goodData = getInfoFromHand(props?.data?.data);
	const data = goodData.currentPlayer?.[0];
	useEffect(() => {
		if (data) {
			const timer = setTimeout(() => {
				props.handleClose();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [data, props]);
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="p-5 border border-[#4B4B4B] bg-[#232323fe] rounded-lg relative backdrop-blur-lg"
		>
			<div className="absolute size-6 rotate-45 top-0 right-0 translate-y-[-50%] bg-[#232323] -translate-x-[150%] z-0"></div>
			{goodData.currentPlayer ? (
				<Hand
					userCards={goodData.currentPlayer ?? []}
					flop={props.data.flop}
					score={goodData.gtoScore}
					amount={goodData.totalPot}
					win={goodData.isWinner}
					buyIn={goodData.buyIn}
				/>
			) : (
				<p className="text-white/50 flex items-center gap-2">
					<motion.span
						animate={{ rotate: 360 }}
						transition={{ duration: 3, repeat: Infinity }}
					>
						<Icons.spinner className="flex" />
					</motion.span>{" "}
					<span>Analyzing</span>
				</p>
			)}
		</motion.div>
	);
}
