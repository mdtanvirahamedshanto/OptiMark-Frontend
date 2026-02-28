"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const BACKEND_V1_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface Plan {
  id: number;
  code: string;
  name: string;
  price_amount: number;
  currency: string;
  billing_cycle: string;
  tokens_included: number;
  is_active: boolean;
}

export default function AdminPlansPage() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mcqscanner_token");
      const res = await fetch(`${BACKEND_V1_BASE_URL}/plans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingPlan?.code ||
      !editingPlan?.name ||
      editingPlan.price_amount === undefined ||
      editingPlan.tokens_included === undefined
    ) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("mcqscanner_token");

      if (editingPlan.id) {
        // Update
        const res = await fetch(
          `${BACKEND_V1_BASE_URL}/plans/${editingPlan.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              code: editingPlan.code,
              name: editingPlan.name,
              price_amount: Number(editingPlan.price_amount),
              currency: editingPlan.currency || "BDT",
              billing_cycle: editingPlan.billing_cycle || "monthly",
              tokens_included: Number(editingPlan.tokens_included),
              is_active: editingPlan.is_active,
            }),
          },
        );
        if (!res.ok)
          throw new Error((await res.json()).detail || "Failed to update");
        addToast("Plan updated successfully", "success");
      } else {
        // Create
        const res = await fetch(`${BACKEND_V1_BASE_URL}/plans`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            code: editingPlan.code,
            name: editingPlan.name,
            price_amount: Number(editingPlan.price_amount),
            currency: editingPlan.currency || "BDT",
            billing_cycle: editingPlan.billing_cycle || "monthly",
            tokens_included: Number(editingPlan.tokens_included),
          }),
        });
        if (!res.ok)
          throw new Error((await res.json()).detail || "Failed to create");
        addToast("Plan created successfully", "success");
      }
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      const msg = err.message || "Failed to save plan";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to deactivate this plan? Users will no longer be able to purchase it.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("mcqscanner_token");
      const res = await fetch(`${BACKEND_V1_BASE_URL}/plans/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      addToast("Plan deactivated successfully", "success");
      fetchPlans();
    } catch {
      addToast("Failed to deactivate plan", "error");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-500">
            Manage available subscription packages
          </p>
        </div>
        {!editingPlan && (
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() =>
              setEditingPlan({
                code: "",
                name: "",
                price_amount: 0,
                currency: "BDT",
                billing_cycle: "monthly",
                tokens_included: 0,
                is_active: true,
              })
            }
          >
            Create New Plan
          </Button>
        )}
      </div>

      {editingPlan && (
        <Card className="border-[#1e3a5f] shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle>
              {editingPlan.id ? "Edit Plan" : "Create New Plan"}
            </CardTitle>
            <CardDescription>
              Configure the subscription package details.
            </CardDescription>
          </CardHeader>
          <div className="p-6">
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Plan Code (Unique)"
                  value={editingPlan.code || ""}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, code: e.target.value })
                  }
                  placeholder="e.g. BASIC_500"
                  required
                />
                <Input
                  label="Display Name"
                  value={editingPlan.name || ""}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  placeholder="e.g. Basic Plan"
                  required
                />
                <Input
                  label="Price Amount"
                  type="number"
                  min="0"
                  value={editingPlan.price_amount || 0}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      price_amount: Number(e.target.value),
                    })
                  }
                  required
                />
                <Input
                  label="Tokens Included"
                  type="number"
                  min="0"
                  value={editingPlan.tokens_included || 0}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      tokens_included: Number(e.target.value),
                    })
                  }
                  required
                />
                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_active ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                    />
                    Is Active
                  </label>
                  <p className="text-xs text-slate-500 ml-2">
                    Active plans are visible to users.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingPlan(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingPlan.id ? "Save Changes" : "Create Plan"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">
            No plans found. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={!plan.is_active ? "opacity-60 bg-slate-50" : ""}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {plan.code}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${plan.is_active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}
                  >
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Price:</span>
                    <span className="font-semibold text-slate-900">
                      {plan.price_amount} {plan.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tokens:</span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {plan.tokens_included.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cycle:</span>
                    <span className="capitalize text-slate-700">
                      {plan.billing_cycle}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                    onClick={() => setEditingPlan(plan)}
                    disabled={!!editingPlan}
                  >
                    Edit
                  </Button>
                  {plan.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<X className="h-3.5 w-3.5" />}
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={!!editingPlan}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
