import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  AddBox as AddBoxIcon,
  DriveEta as DriveEtaIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../services/api';

// Hızlı form tipleri
interface QuickPersonnelForm {
  name: string;
  surname: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

interface QuickInventoryForm {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  value: number;
}

interface QuickVehicleForm {
  brand: string;
  model: string;
  year: number;
  plate: string;
  type: string;
}

const Dashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dialog states
  const [personnelDialog, setPersonnelDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form hooks
  const personnelForm = useForm<QuickPersonnelForm>();
  const inventoryForm = useForm<QuickInventoryForm>();
  const vehicleForm = useForm<QuickVehicleForm>();

  // Hızlı seçenekler
  const departments = ['IT', 'İnsan Kaynakları', 'Muhasebe', 'Satış', 'Pazarlama', 'Operasyon', 'Yönetim'];
  const positions = ['Uzman', 'Kıdemli Uzman', 'Müdür', 'Müdür Yardımcısı', 'Direktör', 'Genel Müdür'];
  const categories = ['Bilgisayar', 'Ofis Ekipmanı', 'İletişim', 'Mobilya', 'Araç Gereçleri', 'Diğer'];
  const vehicleTypes = ['Otomobil', 'Kamyonet', 'Kamyon', 'Minibüs', 'Otobüs', 'Motosiklet'];

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [personnel, inventory, vehicles, assignments] = await Promise.all([
          apiService.getPersonnel(),
          apiService.getInventory(),
          apiService.getVehicles(),
          apiService.getAssignments(),
        ]);

        dispatch({ type: 'SET_PERSONNEL', payload: personnel });
        dispatch({ type: 'SET_INVENTORY', payload: inventory });
        dispatch({ type: 'SET_VEHICLES', payload: vehicles });
        dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Veriler yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, [dispatch]);

  // Hızlı kayıt fonksiyonları
  const handleQuickPersonnel = async (data: QuickPersonnelForm) => {
    try {
      const newPersonnel = await apiService.createPersonnel({
        ...data,
        startDate: new Date().toISOString().split('T')[0],
      });
      dispatch({ type: 'ADD_PERSONNEL', payload: newPersonnel });
      setPersonnelDialog(false);
      personnelForm.reset();
      setSnackbar({ open: true, message: 'Personel başarıyla eklendi!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Personel eklenirken hata oluştu!', severity: 'error' });
    }
  };

  const handleQuickInventory = async (data: QuickInventoryForm) => {
    try {
      const newItem = await apiService.createInventoryItem({
        ...data,
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: 1,
      });
      dispatch({ type: 'ADD_INVENTORY', payload: newItem });
      setInventoryDialog(false);
      inventoryForm.reset();
      setSnackbar({ open: true, message: 'Envanter öğesi başarıyla eklendi!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Envanter öğesi eklenirken hata oluştu!', severity: 'error' });
    }
  };

  const handleQuickVehicle = async (data: QuickVehicleForm) => {
    try {
      const newVehicle = await apiService.createVehicle({
        ...data,
        inventoryItems: [],
      });
      dispatch({ type: 'ADD_VEHICLE', payload: newVehicle });
      setVehicleDialog(false);
      vehicleForm.reset();
      setSnackbar({ open: true, message: 'Araç başarıyla eklendi!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Araç eklenirken hata oluştu!', severity: 'error' });
    }
  };

  const activeAssignments = state.assignments.filter(a => a.status === 'active');
  const recentAssignments = state.assignments.slice(0, 5);

  const stats = [
    {
      title: 'Toplam Personel',
      value: state.personnel.length,
      icon: <PeopleIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
      color: '#1976d2',
      path: '/personnel'
    },
    {
      title: 'Envanter Öğeleri',
      value: state.inventory.length,
      icon: <InventoryIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
      color: '#388e3c',
      path: '/inventory'
    },
    {
      title: 'Toplam Araç',
      value: state.vehicles.length,
      icon: <CarIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
      color: '#f57c00',
      path: '/vehicles'
    },
    {
      title: 'Aktif Zimmetler',
      value: activeAssignments.length,
      icon: <AssignmentIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
      color: '#7b1fa2',
      path: '/assignments'
    },
  ];

  const speedDialActions = [
    {
      icon: <PersonAddIcon />,
      name: 'Hızlı Personel Ekle',
      onClick: () => setPersonnelDialog(true),
    },
    {
      icon: <AddBoxIcon />,
      name: 'Hızlı Envanter Ekle',
      onClick: () => setInventoryDialog(true),
    },
    {
      icon: <DriveEtaIcon />,
      name: 'Hızlı Araç Ekle',
      onClick: () => setVehicleDialog(true),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Sistem genel durumu ve hızlı işlemler
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant={isMobile ? "body2" : "h6"} 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      sx={{ 
                        fontWeight: 'bold',
                        color: stat.color,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.8 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: 'fit-content' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Son Zimmet İşlemleri
            </Typography>
            {recentAssignments.length > 0 ? (
              <List dense={isMobile}>
                {recentAssignments.map((assignment) => {
                  const personnel = state.personnel.find(p => p.id === assignment.personnelId);
                  const vehicle = state.vehicles.find(v => v.id === assignment.vehicleId);
                  
                  return (
                    <ListItem 
                      key={assignment.id}
                      sx={{ 
                        px: { xs: 0, sm: 1 },
                        py: { xs: 0.5, sm: 1 }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ fontWeight: 'medium' }}
                          >
                            {personnel ? `${personnel.name} ${personnel.surname}` : 'Bilinmiyor'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              color="textSecondary"
                            >
                              {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : 'Bilinmiyor'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{ display: 'block' }}
                            >
                              {new Date(assignment.assignDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={assignment.status === 'active' ? 'Aktif' : 'İade Edildi'}
                        color={assignment.status === 'active' ? 'primary' : 'default'}
                        size={isMobile ? "small" : "medium"}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ textAlign: 'center', py: 3 }}
              >
                Henüz zimmet işlemi bulunmuyor
              </Typography>
            )}
            <CardActions sx={{ justifyContent: 'center', pt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/assignments')}
                size={isMobile ? "small" : "medium"}
              >
                Tüm Zimmetleri Görüntüle
              </Button>
            </CardActions>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: 'fit-content' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Hızlı İşlemler
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setPersonnelDialog(true)}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                  size={isMobile ? "small" : "medium"}
                >
                  Hızlı Personel Ekle
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddBoxIcon />}
                  onClick={() => setInventoryDialog(true)}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                  size={isMobile ? "small" : "medium"}
                >
                  Hızlı Envanter Ekle
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DriveEtaIcon />}
                  onClick={() => setVehicleDialog(true)}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                  size={isMobile ? "small" : "medium"}
                >
                  Hızlı Araç Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Speed Dial for Mobile */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Hızlı İşlemler"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      )}

      {/* Hızlı Personel Ekleme Dialog */}
      <Dialog 
        open={personnelDialog} 
        onClose={() => setPersonnelDialog(false)}
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={personnelForm.handleSubmit(handleQuickPersonnel)}>
          <DialogTitle>
            Hızlı Personel Ekle
            {isMobile && (
              <Button
                onClick={() => setPersonnelDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </Button>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={personnelForm.control}
                  rules={{ required: 'Ad gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ad"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!personnelForm.formState.errors.name}
                      helperText={personnelForm.formState.errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="surname"
                  control={personnelForm.control}
                  rules={{ required: 'Soyad gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Soyad"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!personnelForm.formState.errors.surname}
                      helperText={personnelForm.formState.errors.surname?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={personnelForm.control}
                  rules={{ 
                    required: 'Email gereklidir',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir email adresi giriniz'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!personnelForm.formState.errors.email}
                      helperText={personnelForm.formState.errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={personnelForm.control}
                  rules={{ required: 'Telefon gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefon"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      placeholder="0532-123-4567"
                      error={!!personnelForm.formState.errors.phone}
                      helperText={personnelForm.formState.errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={personnelForm.control}
                  rules={{ required: 'Departman gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Departman</InputLabel>
                      <Select {...field} label="Departman">
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="position"
                  control={personnelForm.control}
                  rules={{ required: 'Pozisyon gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Pozisyon</InputLabel>
                      <Select {...field} label="Pozisyon">
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={() => setPersonnelDialog(false)}>İptal</Button>
            <Button type="submit" variant="contained">Ekle</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Hızlı Envanter Ekleme Dialog */}
      <Dialog 
        open={inventoryDialog} 
        onClose={() => setInventoryDialog(false)}
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={inventoryForm.handleSubmit(handleQuickInventory)}>
          <DialogTitle>
            Hızlı Envanter Ekle
            {isMobile && (
              <Button
                onClick={() => setInventoryDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </Button>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={inventoryForm.control}
                  rules={{ required: 'Öğe adı gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Öğe Adı"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!inventoryForm.formState.errors.name}
                      helperText={inventoryForm.formState.errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={inventoryForm.control}
                  rules={{ required: 'Kategori gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Kategori</InputLabel>
                      <Select {...field} label="Kategori">
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="brand"
                  control={inventoryForm.control}
                  rules={{ required: 'Marka gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Marka"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!inventoryForm.formState.errors.brand}
                      helperText={inventoryForm.formState.errors.brand?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="model"
                  control={inventoryForm.control}
                  rules={{ required: 'Model gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Model"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!inventoryForm.formState.errors.model}
                      helperText={inventoryForm.formState.errors.model?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="serialNumber"
                  control={inventoryForm.control}
                  rules={{ required: 'Seri numarası gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Seri Numarası"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!inventoryForm.formState.errors.serialNumber}
                      helperText={inventoryForm.formState.errors.serialNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="value"
                  control={inventoryForm.control}
                  rules={{ 
                    required: 'Değer gereklidir',
                    min: { value: 0, message: 'Değer 0\'dan büyük olmalıdır' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Değer (₺)"
                      type="number"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!inventoryForm.formState.errors.value}
                      helperText={inventoryForm.formState.errors.value?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={() => setInventoryDialog(false)}>İptal</Button>
            <Button type="submit" variant="contained">Ekle</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Hızlı Araç Ekleme Dialog */}
      <Dialog 
        open={vehicleDialog} 
        onClose={() => setVehicleDialog(false)}
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={vehicleForm.handleSubmit(handleQuickVehicle)}>
          <DialogTitle>
            Hızlı Araç Ekle
            {isMobile && (
              <Button
                onClick={() => setVehicleDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </Button>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="brand"
                  control={vehicleForm.control}
                  rules={{ required: 'Marka gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Marka"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!vehicleForm.formState.errors.brand}
                      helperText={vehicleForm.formState.errors.brand?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="model"
                  control={vehicleForm.control}
                  rules={{ required: 'Model gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Model"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!vehicleForm.formState.errors.model}
                      helperText={vehicleForm.formState.errors.model?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="year"
                  control={vehicleForm.control}
                  rules={{ 
                    required: 'Yıl gereklidir',
                    min: { value: 1900, message: 'Geçerli bir yıl giriniz' },
                    max: { value: new Date().getFullYear() + 1, message: 'Geçerli bir yıl giriniz' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Yıl"
                      type="number"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!vehicleForm.formState.errors.year}
                      helperText={vehicleForm.formState.errors.year?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="plate"
                  control={vehicleForm.control}
                  rules={{ required: 'Plaka gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Plaka"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      placeholder="34 ABC 123"
                      error={!!vehicleForm.formState.errors.plate}
                      helperText={vehicleForm.formState.errors.plate?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={vehicleForm.control}
                  rules={{ required: 'Araç tipi gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Araç Tipi</InputLabel>
                      <Select {...field} label="Araç Tipi">
                        {vehicleTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={() => setVehicleDialog(false)}>İptal</Button>
            <Button type="submit" variant="contained">Ekle</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;