import React from "react";
import * as Lucide from "lucide-react";

const createIcon = (LucideComp) => {
  return React.forwardRef(({ className = "", size = 16, style, ...props }, ref) => {
    return (
      <LucideComp
        ref={ref}
        size={size}
        className={`inline-block align-middle ${className}`}
        style={style}
        {...props}
      />
    );
  });
};

export const AppstoreAddOutlined = createIcon(Lucide.LayoutDashboard);
export const BookFilled = createIcon(Lucide.BookOpen);
export const BookOutlined = createIcon(Lucide.BookOpen);
export const DatabaseFilled = createIcon(Lucide.Database);
export const FormOutlined = createIcon(Lucide.ClipboardList);
export const PieChartOutlined = createIcon(Lucide.PieChart);
export const SignatureOutlined = createIcon(Lucide.FileCheck);
export const UserAddOutlined = createIcon(Lucide.UserPlus);
export const UserOutlined = createIcon(Lucide.User);
export const EditOutlined = createIcon(Lucide.Pencil);
export const SaveOutlined = createIcon(Lucide.Save);
export const BellFilled = createIcon(Lucide.Bell);
export const MenuOutlined = createIcon(Lucide.Menu);
export const SwapOutlined = createIcon(Lucide.ArrowLeftRight);
export const ArrowLeftOutlined = createIcon(Lucide.ArrowLeft);
export const ArrowRightOutlined = createIcon(Lucide.ArrowRight);
export const DeleteFilled = createIcon(Lucide.Trash2);
export const LockOutlined = createIcon(Lucide.Lock);
export const SyncOutlined = createIcon(Lucide.RefreshCw);
export const FileOutlined = createIcon(Lucide.File);
export const CheckCircleOutlined = createIcon(Lucide.CheckCircle2);
export const CheckCircleFilled = createIcon(Lucide.CheckCircle2);
export const PlusCircleOutlined = createIcon(Lucide.PlusCircle);
export const MinusCircleOutlined = createIcon(Lucide.MinusCircle);
export const PlusOutlined = createIcon(Lucide.Plus);
export const CloseOutlined = createIcon(Lucide.X);
export const UploadOutlined = createIcon(Lucide.Upload);
export const SearchOutlined = createIcon(Lucide.Search);
export const CloudFilled = createIcon(Lucide.Cloud);
export const DownloadOutlined = createIcon(Lucide.Download);
export const FilterOutlined = createIcon(Lucide.Filter);
export const AntDesignOutlined = createIcon(Lucide.Sparkles);
export const KeyOutlined = createIcon(Lucide.Key);
export const SendOutlined = createIcon(Lucide.Send);
export const CopyOutlined = createIcon(Lucide.Copy);
export const ExclamationCircleFilled = createIcon(Lucide.AlertCircle);
export const CheckOutlined = createIcon(Lucide.Check);
export const ClearOutlined = createIcon(Lucide.RotateCcw);
export const FileTextOutlined = createIcon(Lucide.FileText);
export const ReloadOutlined = createIcon(Lucide.RotateCw);
export const MailOutlined = createIcon(Lucide.Mail);
export const CalendarOutlined = createIcon(Lucide.Calendar);
export const EyeOutlined = createIcon(Lucide.Eye);
export const EyeInvisibleOutlined = createIcon(Lucide.EyeOff);

export default {
  AppstoreAddOutlined,
  BookFilled,
  BookOutlined,
  DatabaseFilled,
  FormOutlined,
  PieChartOutlined,
  SignatureOutlined,
  UserAddOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  BellFilled,
  MenuOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteFilled,
  LockOutlined,
  SyncOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  PlusCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  CloseOutlined,
  UploadOutlined,
  SearchOutlined,
  CloudFilled,
  DownloadOutlined,
  FilterOutlined,
  AntDesignOutlined,
  KeyOutlined,
  SendOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  CheckOutlined,
  ClearOutlined,
  FileTextOutlined,
  ReloadOutlined,
  MailOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
};
