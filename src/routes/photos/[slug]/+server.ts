import { PUBLIC_IMAGE_PATH } from '$env/static/public';
import { User } from '$lib/server/user';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

export const GET: RequestHandler = async ({params}) => {
    const user_id = Number(params.slug);
    const user = await User().getSingle(user_id);
    console.log(user);
    
    if(!user || !user.avatar_path) {
        throw error(404, 'User or avatar not found');
    }

    const filePath = join(PUBLIC_IMAGE_PATH, user.avatar_path);
        
    if (!existsSync(filePath)) {
        console.error('File does not exist:', filePath);
                try {
            const fs = await import('fs');
            const files = fs.readdirSync(PUBLIC_IMAGE_PATH);
        } catch (e) {
        }
        
        throw error(404, 'Image file not found');
    }
    
    try {
        const file = readFileSync(filePath);
        const ext = extname(user.avatar_path).toLowerCase();
        const contentType = mimeTypes[ext] || 'image/jpeg';

        return new Response(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch(err: any) {
        console.error('Error reading file:', err);
        throw error(500, 'Failed to read image file');
    }
};