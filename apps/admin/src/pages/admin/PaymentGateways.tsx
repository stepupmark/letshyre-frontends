import { Link } from "react-router";
import Button from "../../components/ui/button/Button";
import { usePaymentGateways } from "../../hooks/usePaymentGateways";
import GatewayCard from "./PaymentGatewaysCard";
import PaymentGatewayCardSkeleton from "../../components/Skeletons/PaymentGatewayCardSkeleton";

export type Gateway = {
  id: string;
  name: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  isSandbox: boolean;
};

export default function PaymentGateways() {
  const { data, isLoading } = usePaymentGateways();

  if (isLoading) {
    return <PaymentGatewayCardSkeleton />;
  }

  return (
    <div className="w-full space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Gateways
          </h1>
          <p className="text-sm text-gray-500">
            Manage and configure your payment providers
          </p>
        </div>
        <Link to="/dashboard/add-payment-gateway">
          <Button className="h-10 px-5">+ Add Gateway</Button>
        </Link>
      </div>

      {/* List */}
      <div className="grid max-w-5xl gap-4 mr-auto xl:w-full">
        {data?.map((gateway) => (
          <GatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </div>
    </div>
  );
}
