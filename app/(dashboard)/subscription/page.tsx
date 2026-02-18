"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Banknote,
  Send,
  Copy,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { api, getApiErrorMessage } from "@/lib/api";

const CURRENCY = "৳";

const PLANS = [
  { id: "1month", name: "1 Month", price: "500", priceValue: 500, popular: false },
  { id: "6month", name: "6 Months", price: "2,500", priceValue: 2500, popular: true, savings: "Save 17%" },
  { id: "1year", name: "1 Year", price: "4,500", priceValue: 4500, popular: false, savings: "Save 25%" },
];

const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", icon: Smartphone, color: "bg-pink-500" },
  { id: "nagad", name: "Nagad", icon: Smartphone, color: "bg-orange-500" },
  { id: "bank_transfer", name: "Send Money / Bank Transfer", icon: CreditCard, color: "bg-slate-600" },
];

const PAYMENT_DETAILS: Record<string, { number?: string; bank_name?: string; account_name?: string; account_number?: string; routing?: string; instructions: string }> = {
  bkash: {
    number: "01700000000",
    instructions: "Send money to this bKash number. Use your transaction ID as reference.",
  },
  nagad: {
    number: "01700000000",
    instructions: "Send money to this Nagad number. Use your transaction ID as reference.",
  },
  bank_transfer: {
    bank_name: "Your Bank Name",
    account_name: "OptiMark",
    account_number: "1234567890",
    routing: "BRAC-0001",
    instructions: "Send money to the above account. Include your transaction ID in the transfer note.",
  },
};

export default function SubscriptionPage() {
  const { addToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myPayments, setMyPayments] = useState<Array<{ id: number; plan_id: string; amount: number; payment_method: string; transaction_id: string; status: string; admin_notes?: string; created_at: string }>>([]);
  const [formData, setFormData] = useState({
    transactionId: "",
    amount: "",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
  });

  useEffect(() => {
    api.get("/subscription/my-payments").then((r) => {
      setMyPayments(r.data?.payments || []);
    }).catch(() => {});
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard`, "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !paymentMethod) return;
    setIsSubmitting(true);
    try {
      await api.post("/subscription/manual-payment", {
        plan: selectedPlan,
        payment_method: paymentMethod,
        transaction_id: formData.transactionId,
        amount: formData.amount,
        sender_name: formData.senderName,
        sender_phone: formData.senderPhone || undefined,
        sender_email: formData.senderEmail || undefined,
      });
      addToast("Payment submitted. Admin will verify within 24 hours.", "success");
      setFormData({ transactionId: "", amount: "", senderName: "", senderPhone: "", senderEmail: "" });
      setPaymentMethod(null);
      const r = await api.get("/subscription/my-payments");
      setMyPayments(r.data?.payments || []);
    } catch (err: unknown) {
      addToast(getApiErrorMessage(err, "Failed to submit. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const details = paymentMethod ? PAYMENT_DETAILS[paymentMethod] : null;
  const planPrice = selectedPlan ? PLANS.find((p) => p.id === selectedPlan)?.priceValue : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-[#1e3a5f] transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#1e3a5f]">Subscription</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Plan selection */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose a Plan</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${selectedPlan === plan.id ? "ring-2 ring-[#1e3a5f] border-[#1e3a5f]" : "hover:border-[#1e3a5f]/50"}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-[#1e3a5f] text-white text-xs font-medium rounded">Popular</span>
                )}
                <div className="text-center">
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="text-2xl font-bold text-[#1e3a5f] mt-1">{CURRENCY}{plan.price}</p>
                  {plan.savings && <span className="inline-block mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{plan.savings}</span>}
                  <div className="mt-4 flex justify-center">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? "border-[#1e3a5f] bg-[#1e3a5f]" : "border-slate-300"}`}>
                      {selectedPlan === plan.id && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment method selection */}
        {selectedPlan && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
            <p className="text-sm text-slate-600 mb-4">Pay via bKash, Nagad, or Bank Transfer. Admin will approve within 24 hours.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                return (
                  <Card
                    key={pm.id}
                    className={`cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === pm.id ? "ring-2 ring-[#1e3a5f] border-[#1e3a5f]" : "hover:border-[#1e3a5f]/50"}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <div className={`w-12 h-12 rounded-lg ${pm.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{pm.name}</p>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.id ? "border-[#1e3a5f] bg-[#1e3a5f]" : "border-slate-300"}`}>
                      {paymentMethod === pm.id && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment details & form */}
        {selectedPlan && paymentMethod && details && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Money</CardTitle>
                <CardDescription>{details.instructions}</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {details.number && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{details.number}</span>
                      <button type="button" onClick={() => copyToClipboard(details.number!, "Number")} className="p-1 rounded hover:bg-slate-100">
                        <Copy className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
                {details.bank_name && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Bank</span>
                      <span className="font-medium">{details.bank_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Account</span>
                      <span className="font-medium">{details.account_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{details.account_number}</span>
                        <button type="button" onClick={() => copyToClipboard(details.account_number!, "Account number")} className="p-1 rounded hover:bg-slate-100">
                          <Copy className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Confirmation</CardTitle>
                <CardDescription>Submit your transaction details after sending the payment</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Transaction ID" value={formData.transactionId} onChange={(e) => setFormData((p) => ({ ...p, transactionId: e.target.value }))} placeholder="From receipt" required />
                <Input label="Amount Sent" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))} placeholder={String(planPrice)} required />
                <Input label="Sender Name" value={formData.senderName} onChange={(e) => setFormData((p) => ({ ...p, senderName: e.target.value }))} placeholder="Your name" required />
                {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                  <Input label="Sender Phone" value={formData.senderPhone} onChange={(e) => setFormData((p) => ({ ...p, senderPhone: e.target.value }))} placeholder="01XXXXXXXXX" />
                )}
                <Input label="Email" type="email" value={formData.senderEmail} onChange={(e) => setFormData((p) => ({ ...p, senderEmail: e.target.value }))} placeholder="you@example.com" />
                <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
                  Submit Payment
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* My Payments */}
        {myPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Payment Submissions</CardTitle>
              <CardDescription>Track your payment status. Admin will approve within 24 hours.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">{p.plan_id}</td>
                      <td className="py-3 px-4 capitalize">{p.payment_method.replace("_", " ")}</td>
                      <td className="py-3 px-4">{CURRENCY}{p.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          p.status === "approved" ? "bg-green-100 text-green-800" :
                          p.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {p.status === "pending" && <Clock className="h-3 w-3" />}
                          {p.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
