import { Link } from "react-router";
import Button from "../../components/legacy-ui/button/Button";
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Payment Gateways
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and configure your payment providers
          </p>
        </div>
        <Link to="/dashboard/payment-gateways/new">
          <Button className="h-10 px-5">+ Add Gateway</Button>
        </Link>
      </div>

      <div className="mr-auto grid max-w-5xl gap-4 xl:w-full">
        {data?.map((gateway) => (
          <GatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </div>
    </div>
  );
}
