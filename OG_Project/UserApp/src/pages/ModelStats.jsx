import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import NavBar from "../components/NavBar";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_URLS } from "../apiUrls";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ModelStats = () => {
  const [modelStats, setModelStats] = useState({});
  const authToken = localStorage.getItem("authToken");

  const fetchModelStats = async () => {
    try {
      const response = await axios.get(API_URLS.FETCH_MODEL_STATS, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        const stats = response.data;
        console.log("Model Stats:", stats);
        setModelStats(stats); // Store model stats in state
      } else {
        toast.error("No model stats found.");
      }
    } catch (err) {
      console.error("Error fetching model stats:", err);
      toast.error("Failed to fetch model stats.");
    }
  };

  useEffect(() => {
    fetchModelStats();
  }, []);

  return (
    <div className="min-h-screen mx-auto z-20">
      <NavBar />
      <Header />
      <div className="mx-7 px-10 relative">
        {Object.keys(modelStats).length > 0 && (
          <div className="w-full">
            <Carousel className="w-full max-w-full">
              <CarouselContent>
                {Object.entries(modelStats).map(([modelName, images], index) => (
                  <CarouselItem key={index} className="flex justify-center">
                    <div className="flex justify-between items-center w-full max-w-full p-6">
                      {Object.entries(images).map(([imageName, base64Image], imgIndex) => (
                        <div key={imgIndex} className="w-1/2 px-2">
                          <Card className="w-full max-w-full">
                            <CardContent className="flex justify-center items-center p-0">
                              <img
                                src={`data:image/png;base64,${base64Image}`}
                                alt={imageName}
                                className="object-contain w-full max-h-screen"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>
      <h1 className="text-center font-bold text-5xl mb-5">Other <span className="text-purple-400">Visualizations</span></h1>
      <div className="mx-7 pb-5 px-10 relative">
        {modelStats["visualizations"] && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {Object.entries(modelStats["visualizations"]).map(([imageName, base64Image], index) => (
              <div key={index} className="w-full max-w-full">
                <Card className="w-full max-w-full">
                  <CardContent className="flex justify-center items-center p-0">
                    <img
                      src={`data:image/png;base64,${base64Image}`}
                      alt={imageName}
                      className="object-contain w-full max-h-screen"
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModelStats;
