import { useEffect, useState } from "react";

import {
  getFaydaVerifications,
  type FaydaVerification,
  type FaydaVerificationStatus,
} from "../../api/adminApi";


function FaydaKycPage() {

  const [verifications, setVerifications] =
    useState<FaydaVerification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedVerification, setSelectedVerification] =
    useState<FaydaVerification | null>(null);


  useEffect(() => {

    const loadVerifications = async () => {

      try {

        setLoading(true);
        setError(null);

        const data =
          await getFaydaVerifications();

        setVerifications(data);

      } catch (err) {

        console.error(
          "Failed to load Fayda verifications:",
          err
        );

        setError(
          "Unable to load Fayda verification records."
        );

      } finally {

        setLoading(false);

      }

    };


    loadVerifications();

  }, []);


  const formatStatus = (
    status: FaydaVerificationStatus
  ) => {

    return status
      .replaceAll("_", " ");

  };


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <section>

        <h1 className="text-2xl font-bold text-slate-900">
          Fayda KYC
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review seller identity verification records.
        </p>

      </section>


      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>
      )}


      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {loading && (

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-sm text-gray-400">
              Loading verification records...
            </p>

          </div>

        )}


        {!loading &&
          verifications.length === 0 &&
          !error && (

            <div className="flex min-h-[300px] items-center justify-center px-6 text-center">

              <div>

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  ◇
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  No verification records
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Fayda verification records will
                  appear here.
                </p>

              </div>

            </div>
          )}


        {!loading &&
          verifications.length > 0 && (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      FCN / UIN
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Verification Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-100">

                  {verifications.map(
                    (verification) => (

                      <tr
                        key={verification.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-900">
                            {verification.user.full_name}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <p className="text-sm text-gray-600">
                            {verification.user.phone ??
                              "—"}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <p className="text-sm text-gray-600">
                            {verification.fcn}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <p className="text-sm text-gray-600">
                            {verification.verification_date
                              ? new Date(
                                  verification.verification_date
                                ).toLocaleDateString()
                              : "—"}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {formatStatus(
                              verification.status
                            )}
                          </span>

                        </td>


                        <td className="px-6 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVerification(
                                verification
                              )
                            }
                            className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                          >
                            Inspect
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* INSPECTION DRAWER */}

      {selectedVerification && (

        <div className="fixed inset-0 z-50 flex justify-end">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close verification"
            onClick={() =>
              setSelectedVerification(null)
            }
            className="absolute inset-0 bg-black/30"
          />


          {/* DRAWER */}

          <aside className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Identity Inspection
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {selectedVerification.user.full_name}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedVerification(null)
                  }
                  className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

            </div>


            <div className="space-y-6 p-6">

              {/* USER INFO */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  User Information
                </p>

                <div className="mt-3 rounded-xl bg-gray-50 p-4">

                  <p className="text-sm font-semibold text-slate-900">
                    {selectedVerification.user.full_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedVerification.user.phone ??
                      "No phone number"}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    FCN / UIN:{" "}
                    {selectedVerification.fcn}
                  </p>

                </div>

              </div>


              {/* PHOTOS */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Identity Photos
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4">

                  <div>

                    <p className="mb-2 text-xs text-gray-500">
                      Government Photo
                    </p>

                    <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">

                      {selectedVerification
                        .government_photo ? (

                        <img
                          src={
                            selectedVerification
                              .government_photo
                          }
                          alt="Government identity"
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No photo
                        </div>

                      )}

                    </div>

                  </div>


                  <div>

                    <p className="mb-2 text-xs text-gray-500">
                      Profile Photo
                    </p>

                    <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">

                      {selectedVerification
                        .profile_photo ? (

                        <img
                          src={
                            selectedVerification
                              .profile_photo
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No photo
                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* STATUS */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Verification Status
                </p>

                <div className="mt-3 rounded-xl border border-gray-200 p-4">

                  <p className="text-sm font-semibold text-slate-900">
                    {formatStatus(
                      selectedVerification.status
                    )}
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      )}

    </div>
  );
}

export default FaydaKycPage;