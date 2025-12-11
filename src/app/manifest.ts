import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "One Quata",
        short_name: "OneQuata",
        description: "Teklif ve Sipariş Yönetim Sistemi",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
            {
                src: "/icons/onequata-192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/icons/onequata-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };
}
