import { useEffect } from "react";
import {
  Newspaper,
  ExternalLink,
  Clock,
} from "lucide-react";

import useNewsStore from "../../store/newsStore";


export default function CryptoNews() {


  const {
    news,
    loading,
    error,
    fetchNews,
  } = useNewsStore();



  useEffect(() => {

    if (!news.length) {

      fetchNews();

    }

  }, []);



  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">


      <div className="flex items-center gap-2 mb-5">

        <Newspaper
          className="text-blue-400"
          size={22}
        />

        <h2 className="text-xl font-bold">
          Crypto News
        </h2>

      </div>



      {loading && (

        <div className="text-gray-400">

          Loading news...

        </div>

      )}



      {error && (

        <div className="text-red-400">

          {error}

        </div>

      )}



      {!loading && !error && (

        <div className="space-y-4">


          {news.map((item,index)=>(


            <div

              key={item.id || index}

              className="
              bg-slate-800
              rounded-xl
              p-4
              "

            >


              <div className="flex justify-between gap-4">


                <div>


                  <h3 className="font-semibold">

                    {item.title}

                  </h3>


                  <p className="
                    text-sm
                    text-gray-400
                    mt-2
                  ">

                    {item.description}

                  </p>


                </div>



              </div>



              <div className="
                flex
                items-center
                justify-between
                mt-4
                text-sm
                "
              >


                <div className="
                  flex
                  items-center
                  gap-2
                  text-gray-400
                ">


                  <Clock size={15}/>


                  {item.source}


                </div>



                <a

                  href={item.url}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="
                  flex
                  items-center
                  gap-1
                  text-blue-400
                  hover:text-blue-300
                  "

                >

                  Read

                  <ExternalLink size={15}/>


                </a>


              </div>



            </div>


          ))}



        </div>

      )}



      {!loading && !error && news.length === 0 && (

        <div className="text-gray-400">

          No news available.

        </div>

      )}



    </div>

  );

}