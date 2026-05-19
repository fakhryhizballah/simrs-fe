"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExamplePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Post Details</h1>
      <h2 className="text-xl font-semibold">{data.title}</h2>
      <p className="mt-2">{data.body}</p>
    </div>
  );
}
