import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
return (
    <section className="py-10 px-4 mt-12">
        <div className="container mx-auto">
            <div className="flex justify-center">
                <div className="text-center max-w-3xl">
                    <h1 className="text-7xl font-bold text-[#203E72]">ERRORE 404</h1>

                    <div
                        className="bg-center bg-no-repeat bg-cover h-96 flex items-center justify-center"
                        style={{
                            backgroundImage:
                                "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
                        }}
                    ></div>

                    <div className="mt-[-50px]">
                        <h3 className="text-2xl text-[#203E72] md:text-3xl font-semibold mb-4">
                            Sembra che ti sia perso
                        </h3>
                        <p className="mb-6 text-lg">
                            La pagina che stai cercando non è disponibile!
                        </p>
                        <Link
                            to="/"
                            className="inline-block rounded border-2 border-[#203E72] hover:text-white hover:bg-[#203E72] px-6 py-2"
                        >
                            Vai alla Home Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default NotFound;
