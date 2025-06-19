import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  Avatar,
  Divider,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext, Personnel as PersonnelType } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface PersonnelFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
}

const departments = ['IT', 'İnsan Kaynakları', 'Muhasebe', 'Satış', 'Pazarlama', 'Operasyon', 'Yönetim'];
const positions = ['Uzman', 'Kıdemli Uzman', 'Müdür', 'Müdür Yardımcısı', 'Direktör', 'Genel Müdür'];

const Personnel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dialog states
  const [open, setOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelType | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPersonnel, setMenuPersonnel] = useState<PersonnelType | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form hook
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PersonnelFormData>();

  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const personnel = await apiService.getPersonnel();
        dispatch({ type: 'SET_PERSONNEL', payload: personnel });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Personel listesi yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadPersonnel();
  }, [dispatch]);

  const handleOpen = (personnel?: PersonnelType) => {
    if (personnel) {
      setEditingPersonnel(personnel);
      reset(personnel);
    } else {
      setEditingPersonnel(null);
      reset({
        name: '',
        surname: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPersonnel(null);
    reset();
  };

  const onSubmit = async (data: PersonnelFormData) => {
    try {
      if (editingPersonnel) {
        const updatedPersonnel = await apiService.updatePersonnel(editingPersonnel.id, data);
        dispatch({ type: 'UPDATE_PERSONNEL', payload: updatedPersonnel });
        setSnackbar({ open: true, message: 'Personel başarıyla güncellendi!', severity: 'success' });
      } else {
        const newPersonnel = await apiService.createPersonnel(data);
        dispatch({ type: 'ADD_PERSONNEL', payload: newPersonnel });
        setSnackbar({ open: true, message: 'Personel başarıyla eklendi!', severity: 'success' });
      }
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'İşlem sırasında hata oluştu!', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deletePersonnel(id);
        dispatch({ type: 'DELETE_PERSONNEL', payload: id });
        setSnackbar({ open: true, message: 'Personel başarıyla silindi!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Silme işlemi sırasında hata oluştu!', severity: 'error' });
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, personnel: PersonnelType) => {
    setAnchorEl(event.currentTarget);
    setMenuPersonnel(personnel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPersonnel(null);
  };

  // Filter personnel
  const filteredPersonnel = state.personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || person.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'IT': '#1976d2',
      'İnsan Kaynakları': '#388e3c',
      'Muhasebe': '#f57c00',
      'Satış': '#7b1fa2',
      'Pazarlama': '#d32f2f',
      'Operasyon': '#455a64',
      'Yönetim': '#795548',
    };
    return colors[department] || '#757575';
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const getWorkDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);

    if (diffYears > 0) {
      return `${diffYears} yıl ${diffMonths} ay`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ay`;
    } else {
      return `${diffDays} gün`;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Personel Yönetimi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Toplam {state.personnel.length} personel • {filteredPersonnel.length} gösteriliyor
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Ad, soyad, email veya pozisyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Departman</InputLabel>
              <Select
                value={departmentFilter}
                label="Departman"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <Box display="flex" gap={1} justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                }}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Temizle
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Yeni Personel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Personnel Grid/List */}
      {isMobile ? (
        // Mobile List View
        <List>
          {filteredPersonnel.map((person) => (
            <React.Fragment key={person.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ 
                      bgcolor: getDepartmentColor(person.department),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getInitials(person.name, person.surname)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {person.name} {person.surname}
                      </Typography>
                      <Chip
                        label={person.department}
                        size="small"
                        sx={{ bgcolor: getDepartmentColor(person.department), color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {person.position}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {person.email}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {person.phone}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {getWorkDuration(person.startDate)} deneyim
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, person)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        // Desktop/Tablet Card View
        <Grid container spacing={2}>
          {filteredPersonnel.map((person) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={person.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Avatar
                      sx={{ 
                        bgcolor: getDepartmentColor(person.department),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getInitials(person.name, person.surname)}
                    </Avatar>
                    <Chip
                      label={person.department}
                      sx={{ bgcolor: getDepartmentColor(person.department), color: 'white' }}
                    />
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {person.name} {person.surname}
                  </Typography>
                  
                  <Typography variant="body2" color="primary" gutterBottom fontWeight="bold">
                    {person.position}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {person.email}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {person.phone}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {getWorkDuration(person.startDate)} deneyim
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                  <Tooltip title="Düzenle">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(person)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(person.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredPersonnel.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm || departmentFilter ? 'Arama kriterlerine uygun personel bulunamadı' : 'Henüz personel eklenmemiş'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ mt: 2 }}
          >
            İlk Personeli Ekle
          </Button>
        </Paper>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpen()}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (menuPersonnel) handleOpen(menuPersonnel);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuPersonnel) handleDelete(menuPersonnel.id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingPersonnel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            {isMobile && (
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Ad gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ad"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="surname"
                  control={control}
                  rules={{ required: 'Soyad gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Soyad"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.surname}
                      helperText={errors.surname?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'E-posta gereklidir',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-posta"
                      type="email"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Telefon gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefon"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      placeholder="0532-123-4567"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={control}
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
                  control={control}
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
              <Grid item xs={12}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'İşe başlama tarihi gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="İşe Başlama Tarihi"
                      type="date"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={handleClose}
              size={isMobile ? "small" : "medium"}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              size={isMobile ? "small" : "medium"}
            >
              {editingPersonnel ? 'Güncelle' : 'Ekle'}
            </Button>
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

export default Personnel;