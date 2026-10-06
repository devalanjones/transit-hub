import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import homeSchema from "../../validations/user/homeSchema";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ArrowDownUp, Bus, CircleDollarSign, LocateFixed, MapPin, Navigation, Search } from "lucide-react";




const Home = () => {

    const navigate = useNavigate();

    const stops = [
        { _id: "1", stopName: "Thiruvananthapuram Central" },
        { _id: "2", stopName: "Thampanoor" },
        { _id: "3", stopName: "Kazhakoottam" },
        { _id: "4", stopName: "Kollam" },
        { _id: "5", stopName: "Attingal" },
        { _id: "6", stopName: "Varkala" },
        { _id: "7", stopName: "Kochi" },
        { _id: "8", stopName: "Alappuzha" },
    ];

    const popularRoutes = [
        {
            id: "1",
            source: "Thiruvananthapuram",
            destination: "Kollam",
        },
        {
            id: "2",
            source: "Thiruvananthapuram",
            destination: "Kochi",
        },
        {
            id: "3",
            source: "Kollam",
            destination: "Alappuzha",
        },
        {
            id: "4",
            source: "Thiruvananthapuram",
            destination: "Attingal",
        },
    ];

    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);

    const {
        setValue,
        watch,
        handleSubmit,
        trigger,
        clearErrors,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(homeSchema),
        defaultValues: {
            from: "",
            fromSelected: false,
            to: "",
            toSelected: false,
        },
    });

    const from = watch("from");
    const to = watch("to");

    const filteredFromStops = stops.filter((stop) =>
        stop.stopName.toLowerCase().includes(from.toLowerCase())
    );

    const filteredToStops = stops.filter((stop) =>
        stop.stopName.toLowerCase().includes(to.toLowerCase())
    );

    const handleFromChange = (event) => {
        setValue("from", event.target.value, {
            shouldDirty: true,
            shouldValidate: false,
        });

        setValue("fromSelected", false);

        clearErrors(["from", "fromSelected", "to"]);

        setShowFromSuggestions(true);
    };

    const handleToChange = (event) => {
        setValue("to", event.target.value, {
            shouldDirty: true,
            shouldValidate: false,
        });

        setValue("toSelected", false);

        clearErrors(["to", "toSelected"]);

        setShowToSuggestions(true);
    };

    const handleFromSelect = (stop) => {
        setValue("from", stop.stopName, {
            shouldValidate: true,
        });

        setValue("fromSelected", true, {
            shouldValidate: true,
        });

        setShowFromSuggestions(false);

        clearErrors(["from", "fromSelected", "to"]);
    };

    const handleToSelect = (stop) => {
        setValue("to", stop.stopName, {
            shouldValidate: true,
        });

        setValue("toSelected", true, {
            shouldValidate: true,
        });

        setShowToSuggestions(false);

        clearErrors(["to", "toSelected"]);
    };

    const handleSwap = () => {
        const fromValue = from;
        const toValue = to;

        const fromSelected = watch("fromSelected");
        const toSelected = watch("toSelected");

        setValue("from", toValue, {
            shouldValidate: true,
        });

        setValue("to", fromValue, {
            shouldValidate: true,
        });

        setValue("fromSelected", toSelected, {
            shouldValidate: true,
        });

        setValue("toSelected", fromSelected, {
            shouldValidate: true,
        });

        setShowFromSuggestions(false);
        setShowToSuggestions(false);

        clearErrors();

        trigger();
    };

    const onSubmit = (data) => {

        navigate(`/user/bus-schedule?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}`);

    };

    return (

        <div className="space-y-8">

            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-[url('/images/bus-hero.jpg')] bg-cover bg-center px-6 py-10 text-white sm:px-10">
                <div className="absolute inset-0 bg-blue-950/75" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Find Your Bus,
                    </h1>

                    <h2 className="mt-2 text-2xl font-semibold text-orange-400 sm:text-3xl">
                        Travel With Ease.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
                        Search bus routes and schedules to plan your journey.
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section className="mx-auto max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-lg dark:border-gray-800 dark:bg-[#11161d] sm:p-7">

                <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                    Search Your Journey
                </h2>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="relative">

                        {/* From */}
                        <div className="relative border-b border-gray-300 pb-6 dark:border-gray-700">

                            <label
                                htmlFor="from"
                                className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400"
                            >
                                FROM
                            </label>

                            <div className="flex items-center gap-3">
                                <MapPin
                                    size={22}
                                    className="shrink-0 text-green-600"
                                />

                                <Input
                                    id="from"
                                    type="text"
                                    value={from}
                                    onChange={handleFromChange}
                                    onFocus={() =>
                                        setShowFromSuggestions(true)
                                    }
                                    placeholder="Enter starting stop"
                                    autoComplete="off"
                                    error={
                                        !!errors.from ||
                                        !!errors.fromSelected
                                    }
                                    className="border-0 bg-transparent px-0 py-2 shadow-none hover:border-0 focus:ring-0 dark:bg-transparent"
                                />
                            </div>

                            {/* From Suggestions */}
                            {showFromSuggestions && from.trim() && (
                                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#202832]">

                                    {filteredFromStops.length > 0 ? (
                                        filteredFromStops.map((stop) => (
                                            <button
                                                key={stop._id}
                                                type="button"
                                                onClick={() => handleFromSelect(stop)}
                                                className="flex w-full items-center gap-3 bg-blue-50 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-blue-400 dark:bg-[#1b222c] dark:text-gray-200 dark:hover:bg-[#400d38]"
                                            >
                                                <MapPin
                                                    size={16}
                                                    className="shrink-0 text-green-600"
                                                />

                                                {stop.stopName}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            No matching stops found.
                                        </p>
                                    )}
                                </div>
                            )}

                            {errors.from && (
                                <ErrorMessage
                                    message={errors.from.message}
                                />
                            )}

                            {errors.fromSelected && (
                                <ErrorMessage
                                    message={errors.fromSelected.message}
                                />
                            )}
                        </div>

                        {/* Swap Button */}
                        <div className="absolute right-5 top-1/2 z-20 -translate-y-1/2">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={handleSwap}
                                className="h-10 w-10 rounded-full p-0"
                                aria-label="Swap From and To"
                            >
                                <ArrowDownUp size={18} />
                            </Button>
                        </div>

                        {/* To */}
                        <div className="relative pt-6">

                            <label
                                htmlFor="to"
                                className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400"
                            >
                                TO
                            </label>

                            <div className="flex items-center gap-3">
                                <MapPin
                                    size={22}
                                    className="shrink-0 text-orange-600"
                                />

                                <Input
                                    id="to"
                                    type="text"
                                    value={to}
                                    onChange={handleToChange}
                                    onFocus={() => {
                                        if (!watch("toSelected")) {
                                            setShowToSuggestions(true)
                                        }
                                    }}

                                    placeholder="Enter destination stop"
                                    autoComplete="off"
                                    error={
                                        !!errors.to ||
                                        !!errors.toSelected
                                    }
                                    className="border-0 bg-transparent px-0 py-2 shadow-none hover:border-0 focus:ring-0 dark:bg-transparent"
                                />
                            </div>

                            {/* To Suggestions */}
                            {showToSuggestions && to.trim() && (
                                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1b222c]">

                                    {filteredToStops.length > 0 ? (
                                        filteredToStops.map((stop) => (
                                            <button
                                                key={stop._id}
                                                type="button"
                                                onClick={() => handleToSelect(stop)}
                                                className="flex w-full items-center gap-3 bg-blue-50 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-blue-400 dark:bg-[#1b222c] dark:text-gray-200 dark:hover:bg-[#400d38]"
                                            >
                                                <MapPin
                                                    size={16}
                                                    className="shrink-0 text-green-600"
                                                />

                                                {stop.stopName}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            No matching stops found.
                                        </p>
                                    )}
                                </div>
                            )}

                            {errors.to && (
                                <ErrorMessage
                                    message={errors.to.message}
                                />
                            )}

                            {errors.toSelected && (
                                <ErrorMessage
                                    message={errors.toSelected.message}
                                />
                            )}
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="mt-8">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                        >
                            <Search size={19} />
                            Search Buses
                        </Button>
                    </div>

                </form>
            </section>

            {/* Popular Routes */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                        Popular Routes
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Explore frequently searched bus routes.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {popularRoutes.map((route) => (
                        <div
                            key={route.id}
                            className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                    <MapPin size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {route.source}
                                    </p>

                                    <div className="my-1 h-px w-8 bg-gray-300 dark:bg-gray-700" />

                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {route.destination}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Choose TransitHub */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                        Why Choose TransitHub?
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Everything you need to make your bus journey easier.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        className="rounded-2xl border border-blue-200 bg-blue-200 p-5 shadow-sm dark:border-blue-900/50 dark:bg-[#17263a]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <Search size={21} />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Easy Bus Search
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Quickly find buses and schedules based on your journey.
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border border-green-200 bg-green-200 p-5 shadow-sm dark:border-green-900/50 dark:bg-[#172b25]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                            <MapPin size={21} />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Find Your Route
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Explore routes and stops to plan your journey with ease.
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border border-purple-200 bg-purple-200 p-5 shadow-sm dark:border-purple-900/50 dark:bg-[#251d38]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <LocateFixed size={21} />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Live Tracking
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Check the live location and current status of running buses.
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border border-orange-200 bg-orange-200 p-5 shadow-sm dark:border-orange-900/50 dark:bg-[#38271a]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                            <CircleDollarSign size={21} />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Fare Charges
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            View bus fare information and know the expected charge for your journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* How TransitHub Works */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                        How TransitHub Works
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Plan your bus journey in just a few simple steps.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Step 1 */}
                    <div className="rounded-2xl border border-blue-200 bg-blue-200 p-5 shadow-sm dark:border-blue-900/50 dark:bg-[#17263a]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <Search size={21} />
                        </div>

                        <div className="mb-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            STEP 01
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Search Your Journey
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Enter your starting point and destination to find suitable buses.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="rounded-2xl border border-green-200 bg-green-200 p-5 shadow-sm dark:border-green-900/50 dark:bg-[#172b25]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                            <Bus size={21} />
                        </div>

                        <div className="mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
                            STEP 02
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Choose Your Bus
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            View available buses, routes, and schedules for your journey.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="rounded-2xl border border-orange-200 bg-orange-200 p-5 shadow-sm dark:border-orange-900/50 dark:bg-[#38271a]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                            <Navigation size={21} />
                        </div>

                        <div className="mb-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                            STEP 03
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Track & Travel
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Check your bus details and stay updated with its current status.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative overflow-hidden rounded-2xl bg-[url('/images/bus-hero.jpg')] bg-cover bg-center px-6 py-10 text-center text-white sm:px-10">
                <div className="absolute inset-0 bg-blue-950/75" />

                <div className="relative z-10 mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold sm:text-3xl">
                        Ready to Find Your Bus?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                        Search routes and schedules and plan your journey with TransitHub.
                    </p>

                    <div className="mt-6">
                        <Button
                            type="button"
                            size="lg"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        >
                            <Search size={19} />
                            Search Buses
                        </Button>
                    </div>
                </div>
            </section>

        </div>

    );

};

export default Home