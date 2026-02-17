import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface RichMenuImageUploaderProps {
  organizationId: number;
  richMenuId: number;
  currentImageUrl?: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export function RichMenuImageUploader({
  organizationId,
  richMenuId,
  currentImageUrl,
  onUploadSuccess,
}: RichMenuImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const uploadImage = trpc.lineRichMenu.uploadImage.useMutation({
    onSuccess: (result) => {
      toast.success('圖片上傳成功');
      onUploadSuccess(result.imageUrl);
    },
    onError: (error) => {
      console.error('上傳失敗:', error);
      toast.error('圖片上傳失敗，請稍後再試');
      setPreview(currentImageUrl || null);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = async (file: File) => {
    // 驗證檔案類型
    if (!file.type.startsWith('image/')) {
      toast.error('請上傳圖片檔案');
      return;
    }

    // 驗證檔案大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不能超過 5MB');
      return;
    }

    // 讀取檔案並顯示預覽
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);

      // 上傳到伺服器
      uploadImage.mutate({
        organizationId,
        richMenuId,
        imageBase64: base64,
        mimeType: file.type,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">圖文選單圖片</h3>
          {preview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploadImage.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              移除
            </Button>
          )}
        </div>

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="圖文選單預覽"
              className="w-full h-auto rounded-lg border-2 border-border"
             loading="lazy" />
            {uploadImage.isPending && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              ${uploadImage.isPending ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="image-upload"
              disabled={uploadImage.isPending}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                {uploadImage.isPending ? (
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        拖曳圖片至此或點擊上傳
                      </p>
                      <p className="text-sm text-muted-foreground">
                        支援 PNG、JPG、GIF 格式，檔案大小不超過 5MB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        建議尺寸：2500 x 1686 px（6 宮格）或 2500 x 843 px（3 宮格）
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>圖片規格要求：</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>6 宮格圖文選單：2500 x 1686 px</li>
                <li>3 宮格圖文選單：2500 x 843 px</li>
                <li>檔案格式：PNG、JPG、GIF</li>
                <li>檔案大小：不超過 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
