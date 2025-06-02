interface AnalyzeBillResponse {
  total: number;
}

export async function analyzeBill(imageUri: string): Promise<AnalyzeBillResponse> {
  // Create form data with the image
  const formData = new FormData();
  const imageUriParts = imageUri.split('.');
  const fileType = imageUriParts[imageUriParts.length - 1] || 'jpeg';
  
  formData.append('image', {
    uri: imageUri,
    type: `image/${fileType}`,
    name: `bill.${fileType}`,
  } as any); // Type assertion needed for React Native FormData

  // TODO: Replace with actual Together.ai endpoint when you have the model details
  const TOGETHER_AI_ENDPOINT = 'https://api.together.ai/v1/vision';

  try {
    const response = await fetch(TOGETHER_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      total: parseFloat(data.total), // Adjust based on actual API response format
    };
  } catch (error) {
    console.error('Error calling Together.ai API:', error);
    throw error;
  }
} 