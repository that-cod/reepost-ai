/**
 * LinkedIn API Integration
 * Handles OAuth and publishing
 */

import axios from 'axios';
import logger, { loggers } from './logger';
import { ExternalServiceError } from './errors';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

/**
 * Get LinkedIn profile
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      id: response.data.id,
      firstName: response.data.localizedFirstName,
      lastName: response.data.localizedLastName,
      profilePicture: response.data.profilePicture?.displayImage,
    };
  } catch (error) {
    loggers.error('Failed to get LinkedIn profile', error as Error);
    throw new ExternalServiceError('LinkedIn', 'Failed to fetch profile');
  }
}

/**
 * Publish post to LinkedIn
 */
export async function publishToLinkedIn(params: {
  accessToken: string;
  personUrn: string;
  content: string;
  mediaUrls?: string[];
}): Promise<string> {
  const { accessToken, personUrn, content, mediaUrls = [] } = params;

  try {
    // Basic text post
    const postData: any = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Add media if provided
    if (mediaUrls.length > 0) {
      const media = await Promise.all(
        mediaUrls.map((url) => uploadMediaToLinkedIn(accessToken, personUrn, url))
      );

      postData.specificContent['com.linkedin.ugc.ShareContent'].media = media.map((asset) => ({
        status: 'READY',
        media: asset,
      }));
    }

    const response = await axios.post(`${LINKEDIN_API_BASE}/ugcPosts`, postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const postId = response.data.id;
    logger.info('Published to LinkedIn', { postId });

    return postId;
  } catch (error: any) {
    loggers.error('Failed to publish to LinkedIn', error as Error, {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new ExternalServiceError('LinkedIn', 'Failed to publish post');
  }
}

/**
 * Upload media to LinkedIn
 */
async function uploadMediaToLinkedIn(
  accessToken: string,
  personUrn: string,
  mediaUrl: string
): Promise<string> {
  try {
    // Register upload
    const registerResponse = await axios.post(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const uploadUrl = registerResponse.data.value.uploadMechanism[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ].uploadUrl;
    const asset = registerResponse.data.value.asset;

    // Download media
    const mediaResponse = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
    });

    // Upload to LinkedIn
    await axios.put(uploadUrl, mediaResponse.data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
    });

    return asset;
  } catch (error) {
    loggers.error('Failed to upload media to LinkedIn', error as Error);
    throw new ExternalServiceError('LinkedIn', 'Failed to upload media');
  }
}

/**
 * Get post analytics from LinkedIn
 */
export async function getPostAnalytics(
  accessToken: string,
  postId: string
): Promise<{
  likes: number;
  comments: number;
  shares: number;
  views: number;
}> {
  try {
    const response = await axios.get(
      `${LINKEDIN_API_BASE}/socialActions/${postId}/(likes,comments)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Note: LinkedIn API has rate limits and may not provide all metrics
    return {
      likes: response.data.likes?.paging?.total || 0,
      comments: response.data.comments?.paging?.total || 0,
      shares: 0, // Would need separate API call
      views: 0, // Would need separate API call with partner program
    };
  } catch (error) {
    loggers.error('Failed to get LinkedIn analytics', error as Error);
    // Don't throw, just return zeros
    return { likes: 0, comments: 0, shares: 0, views: 0 };
  }
}

/**
 * Delete post from LinkedIn
 */
export async function deleteLinkedInPost(
  accessToken: string,
  postId: string
): Promise<void> {
  try {
    await axios.delete(`${LINKEDIN_API_BASE}/ugcPosts/${postId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    logger.info('Deleted LinkedIn post', { postId });
  } catch (error) {
    loggers.error('Failed to delete LinkedIn post', error as Error);
    throw new ExternalServiceError('LinkedIn', 'Failed to delete post');
  }
}
