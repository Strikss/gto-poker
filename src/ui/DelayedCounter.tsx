"use client";

import { useEffect, useState } from "react";

import Counter from "./Counter";

type DelayedCounterProps = Parameters<typeof Counter>[0] & {
	className?: string;
	delay?: number;
};

const DelayedCounter = ({ delay = 0, value, ...props }: DelayedCounterProps) => {
	const [newValue, setNewValue] = useState<number | string>(0);

	useEffect(() => {
		const timer = setTimeout(() => {
			setNewValue(value);
		}, delay);

		return () => clearTimeout(timer);
	}, [delay, value]);

	return <Counter value={newValue} {...props} />;
};

export default DelayedCounter;
