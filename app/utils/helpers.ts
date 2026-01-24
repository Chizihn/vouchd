export const getTierColor = (tier: string | null): string => {
  const colors: Record<string, string> = {
    DIAMOND: "#B9F2FF",
    GOLD: "#FFD700",
    SILVER: "#C0C0C0",
    BRONZE: "#CD7F32",
    UNVERIFIED: "#6B7280",
  };
  return colors[tier || "UNVERIFIED"] || colors.UNVERIFIED;
};

export const getTierBgColor = (tier: string | null): string => {
  const colors: Record<string, string> = {
    DIAMOND: "bg-diamond/20",
    GOLD: "bg-gold/20",
    SILVER: "bg-silver/20",
    BRONZE: "bg-bronze/20",
    UNVERIFIED: "bg-unverified/20",
  };
  return colors[tier || "UNVERIFIED"] || colors.UNVERIFIED;
};

export const getTierTextColor = (tier: string | null): string => {
  const colors: Record<string, string> = {
    DIAMOND: "text-diamond",
    GOLD: "text-gold",
    SILVER: "text-silver",
    BRONZE: "text-bronze",
    UNVERIFIED: "text-unverified",
  };
  return colors[tier || "UNVERIFIED"] || colors.UNVERIFIED;
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCrypto = (
  amount: number,
  asset: string = "USDC",
): string => {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${asset}`;
};

export const formatWalletAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getTimeAgo = (date: string | Date): string => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
};

export const getTradeStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    ESCROWED: "bg-blue-500",
    FIAT_SENT: "bg-purple-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-gray-500",
    DISPUTED: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

export const getTradeStatusText = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    ESCROWED: "Escrowed",
    FIAT_SENT: "Payment Sent",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    DISPUTED: "Disputed",
  };
  return labels[status] || status;
};

export const calculateCompletionRate = (
  completed: number,
  total: number,
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getTimeRemaining = (expiresAt: string | Date): string => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
};
