import { useEffect, useMemo, useState } from "react";
import {
  getBrokerInquiries,
  setBrokerAppointment,
  updateBrokerInquiryStatus,
  type BrokerInquiry,
  type BrokerInquiryStatus,
} from "../../api/adminApi";

function BrokerHubPage() {
  const [inquiries, setInquiries] = useState<BrokerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInquiry, setSelectedInquiry] =
    useState<BrokerInquiry | null>(null);

  const [appointmentDate, setAppointmentDate] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  /* =========================================================
     LOAD INQUIRIES
  ========================================================= */

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBrokerInquiries();

      setInquiries(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load broker inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  /* =========================================================
     PIPELINE COUNTS
  ========================================================= */

  const pipeline = useMemo(() => {
    return {
      NEW: inquiries.filter((item) => item.status === "NEW").length,

      ASSIGNED: inquiries.filter(
        (item) => item.status === "ASSIGNED"
      ).length,

      APPOINTMENT_SCHEDULED: inquiries.filter(
        (item) => item.status === "APPOINTMENT_SCHEDULED"
      ).length,

      MEDIATED: inquiries.filter(
        (item) => item.status === "MEDIATED"
      ).length,

      CLOSED: inquiries.filter(
        (item) => item.status === "CLOSED"
      ).length,
    };
  }, [inquiries]);

  /* =========================================================
     UPDATE LOCAL INQUIRY
  ========================================================= */

  const updateLocalInquiry = (updated: BrokerInquiry) => {
    setInquiries((current) =>
      current.map((inquiry) =>
        inquiry.id === updated.id ? updated : inquiry
      )
    );

    setSelectedInquiry(updated);
  };

  /* =========================================================
     ASSIGN INQUIRY
  ========================================================= */

  const handleAssign = async () => {
    if (!selectedInquiry) return;

    try {
      setActionLoading(true);
      setError(null);

      const updated = await updateBrokerInquiryStatus(
        selectedInquiry.id,
        "ASSIGNED"
      );

      updateLocalInquiry(updated);
    } catch (err) {
      console.error(err);
      setError("Unable to assign inquiry.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     SET APPOINTMENT
  ========================================================= */

  const handleAppointment = async () => {
    if (!selectedInquiry) return;

    if (!appointmentDate) {
      setError("Please select an appointment date and time.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const updated = await setBrokerAppointment(
        selectedInquiry.id,
        appointmentDate
      );

      /*
       * The backend may return the inquiry with the new status.
       * If it doesn't, update the status separately.
       */

      let finalInquiry = updated;

      if (updated.status !== "APPOINTMENT_SCHEDULED") {
        finalInquiry = await updateBrokerInquiryStatus(
          selectedInquiry.id,
          "APPOINTMENT_SCHEDULED"
        );
      }

      updateLocalInquiry(finalInquiry);

      setAppointmentDate("");
    } catch (err) {
      console.error(err);
      setError("Unable to schedule appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     MARK MEDIATED
  ========================================================= */

  const handleMarkMediated = async () => {
    if (!selectedInquiry) return;

    try {
      setActionLoading(true);
      setError(null);

      const updated = await updateBrokerInquiryStatus(
        selectedInquiry.id,
        "MEDIATED"
      );

      updateLocalInquiry(updated);
    } catch (err) {
      console.error(err);
      setError("Unable to update inquiry.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     CLOSE DEAL
  ========================================================= */

  const handleCloseDeal = async () => {
    if (!selectedInquiry) return;

    const confirmed = window.confirm(
      "Mark this brokered inquiry as a closed deal?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError(null);

      const updated = await updateBrokerInquiryStatus(
        selectedInquiry.id,
        "CLOSED"
      );

      updateLocalInquiry(updated);
    } catch (err) {
      console.error(err);
      setError("Unable to close deal.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle = (
    status: BrokerInquiryStatus
  ) => {
    const styles: Record<BrokerInquiryStatus, string> = {
      NEW: "bg-blue-50 text-blue-700",

      ASSIGNED: "bg-purple-50 text-purple-700",

      APPOINTMENT_SCHEDULED:
        "bg-yellow-50 text-yellow-700",

      MEDIATED: "bg-orange-50 text-orange-700",

      CLOSED: "bg-green-50 text-green-700",
    };

    return styles[status];
  };

  const formatStatus = (
    status: BrokerInquiryStatus
  ) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Broker Hub
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage high-value inquiries and coordinate
          brokered deals.
        </p>
      </div>

      {/* =====================================================
          PIPELINE
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <PipelineCard
          title="New"
          count={pipeline.NEW}
        />

        <PipelineCard
          title="Assigned"
          count={pipeline.ASSIGNED}
        />

        <PipelineCard
          title="Appointment"
          count={pipeline.APPOINTMENT_SCHEDULED}
        />

        <PipelineCard
          title="Mediated"
          count={pipeline.MEDIATED}
        />

        <PipelineCard
          title="Closed"
          count={pipeline.CLOSED}
        />
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading broker inquiries...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No broker inquiries
            </p>

            <p className="mt-1 text-sm text-gray-500">
              New high-value inquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Listing
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Buyer
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Seller
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Listing */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {inquiry.product?.image ? (
                          <img
                            src={inquiry.product.image}
                            alt={
                              inquiry.product.name
                            }
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-slate-900">
                            {inquiry.product?.name ??
                              "Unknown listing"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Inquiry #{inquiry.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Buyer */}

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {inquiry.buyer?.full_name ??
                          "Unknown"}
                      </p>

                      {inquiry.buyer?.phone && (
                        <p className="mt-1 text-xs text-gray-500">
                          {inquiry.buyer.phone}
                        </p>
                      )}
                    </td>

                    {/* Seller */}

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {inquiry.seller?.full_name ??
                          "Unknown"}
                      </p>

                      {inquiry.seller
                        ?.fayda_verified && (
                        <p className="mt-1 text-xs font-medium text-green-600">
                          Fayda Verified
                        </p>
                      )}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          inquiry.status
                        )}`}
                      >
                        {formatStatus(
                          inquiry.status
                        )}
                      </span>
                    </td>

                    {/* Action */}

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInquiry(
                            inquiry
                          );
                          setAppointmentDate("");
                          setError(null);
                        }}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          DRAWER
      ===================================================== */}

      {selectedInquiry && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close inquiry"
            onClick={() =>
              setSelectedInquiry(null)
            }
            className="absolute inset-0 h-full w-full cursor-default bg-black/30"
          />

          {/* Drawer */}

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
            {/* Header */}

            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Inquiry Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Inquiry #{selectedInquiry.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedInquiry(null)
                  }
                  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* =================================================
                  LISTING
              ================================================= */}

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Listing
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex gap-4">
                    {selectedInquiry.product?.image ? (
                      <img
                        src={
                          selectedInquiry.product
                            .image
                        }
                        alt={
                          selectedInquiry.product
                            .name
                        }
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedInquiry.product
                          ?.name ??
                          "Unknown listing"}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Category:{" "}
                        {selectedInquiry.product
                          ?.category?.name ??
                          "Unknown"}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedInquiry.product
                          ?.price ?? "Price unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  STATUS
              ================================================= */}

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Current Status
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    selectedInquiry.status
                  )}`}
                >
                  {formatStatus(
                    selectedInquiry.status
                  )}
                </span>
              </section>

              {/* =================================================
                  BUYER
              ================================================= */}

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Buyer
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {selectedInquiry.buyer
                      ?.full_name ??
                      "Unknown buyer"}
                  </p>

                  {selectedInquiry.buyer?.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedInquiry.buyer.phone}
                    </p>
                  )}
                </div>
              </section>

              {/* =================================================
                  SELLER
              ================================================= */}

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Seller
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedInquiry.seller
                          ?.full_name ??
                          "Unknown seller"}
                      </p>

                      {selectedInquiry.seller
                        ?.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          {
                            selectedInquiry
                              .seller.phone
                          }
                        </p>
                      )}
                    </div>

                    {selectedInquiry.seller
                      ?.fayda_verified && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  APPOINTMENT
              ================================================= */}

              {selectedInquiry.status !==
                "CLOSED" && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Appointment
                  </h3>

                  {selectedInquiry.appointment_date ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-400">
                        Scheduled Date
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {new Date(
                          selectedInquiry.appointment_date
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="datetime-local"
                        value={appointmentDate}
                        onChange={(e) =>
                          setAppointmentDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={
                          handleAppointment
                        }
                        className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading
                          ? "Scheduling..."
                          : "Schedule Appointment"}
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <section className="border-t border-gray-100 pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Deal Actions
                </h3>

                <div className="space-y-3">
                  {/* NEW → ASSIGNED */}

                  {selectedInquiry.status ===
                    "NEW" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleAssign}
                      className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Assigning..."
                        : "Assign Inquiry"}
                    </button>
                  )}

                  {/* APPOINTMENT → MEDIATED */}

                  {selectedInquiry.status ===
                    "APPOINTMENT_SCHEDULED" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={
                        handleMarkMediated
                      }
                      className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Updating..."
                        : "Mark as Mediated"}
                    </button>
                  )}

                  {/* MEDIATED → CLOSED */}

                  {selectedInquiry.status ===
                    "MEDIATED" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={
                        handleCloseDeal
                      }
                      className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Closing..."
                        : "Mark Deal Closed"}
                    </button>
                  )}

                  {/* CLOSED */}

                  {selectedInquiry.status ===
                    "CLOSED" && (
                    <div className="rounded-xl bg-green-50 p-4 text-center">
                      <p className="text-sm font-semibold text-green-700">
                        Deal Closed
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        This inquiry has completed
                        the broker workflow.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  CHAT
              ================================================= */}

              <section className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-400"
                >
                  Open Chat Thread
                </button>

                <p className="mt-2 text-center text-xs text-gray-400">
                  Chat integration will be enabled when
                  the backend chat contract is available.
                </p>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PIPELINE CARD
========================================================= */

interface PipelineCardProps {
  title: string;
  count: number;
}

function PipelineCard({
  title,
  count,
}: PipelineCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {count}
      </p>
    </div>
  );
}

export default BrokerHubPage;