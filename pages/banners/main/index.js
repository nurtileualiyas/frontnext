import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../demo/service/ProductService';

import { BannerService } from '../../../demo/service/BannerService';
import { Calendar } from 'primereact/calendar';

const Crud = () => {
    let emptyProduct = {
        id: null,
        name: '',
        image: null,
        description: '',
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };

    let emptyBanner = {
        id: null,
        name: '',
        path: '',
        activate_at: '',
        deactivate_at: '',
    };

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);

    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const [banner, setBanner] = useState(emptyBanner);
    const [banners, setBanners] = useState(null);
    const [bannerDialog, setBannerDialog] = useState(false);
    const [deleteBannerDialog, setDeleteBannerDialog] = useState(false);
    const [deleteBannersDialog, setDeleteBannersDialog] = useState(false);
    const [editBannerStatus, setEditBannerStatus] = useState(false);

    const [selectedBanners, setSelectedBanners] = useState(null);

    const [calendarValue, setCalendarValue] = useState(null);
    const [calendarValue2, setCalendarValue2] = useState(null);

    const onUpload = () => {
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    };

    useEffect(() => {
        const productService = new ProductService();
        productService.getProducts().then((data) => setProducts(data));

        const bannerService = new BannerService();
        bannerService.getBanners().then((data) => setBanners(data));

    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const openNewBanner = () => {
        setBanner(emptyBanner);
        setSubmitted(false);
        setBannerDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
        setBannerDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };
    const hideDeleteBannerDialog = () => {
        setDeleteBannerDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const hideDeleteBannersDialog = () => {
        setDeleteBannersDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (product.name.trim()) {
            let _products = [...products];
            let _product = { ...product };
            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
            } else {
                _product.id = createId();
                _product.code = createId();
                _product.image = 'product-placeholder.svg';
                _products.push(_product);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    async function saveBanner() {
        setSubmitted(true);

        if (banner.name.trim() && banner.path.trim() && banner.activate_at && banner.deactivate_at) {

            let _banners = [...banners];
            let _banner = { ...banner };
            let requestUrl = '';
            let requestMethod = '';

            _banner.activate_at = isIsoDate(_banner.activate_at) ? _banner.activate_at.substring(0, 10) : _banner.activate_at.toISOString().substring(0, 10);
            _banner.deactivate_at = isIsoDate(_banner.deactivate_at) ? _banner.deactivate_at.substring(0, 10) : _banner.deactivate_at.toISOString().substring(0, 10);

            console.log(_banner);

            if (!editBannerStatus) {
                requestUrl = 'http://almaback.almatv.kz/api/banners';
                requestMethod = 'POST';
            } else {
                requestUrl = 'http://almaback.almatv.kz/api/banners/' + _banner.id;
                requestMethod = 'PUT';

                delete _banner.created_at;
                delete _banner.updated_at;
            }

            delete _banner.id;

            let newBanner = await fetch(
                requestUrl,
                {
                    method: requestMethod,
                    body: JSON.stringify(_banner),
                    headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' }
                }
            );

            newBanner = await newBanner.json();

            if (!editBannerStatus) {
                _banners.push(newBanner);
                toast.current.show({ severity: 'success', summary: 'Отлично', detail: 'Баннер создан', life: 3000 });
            } else {
                const index = findIndexById(banner.id);
                _banners[index] = newBanner;
                toast.current.show({ severity: 'success', summary: 'Отлично', detail: 'Баннер изменен', life: 3000 });
            }


            setBanners(_banners);
            setBannerDialog(false);
            setEditBannerStatus(false);
            setBanner(emptyBanner);
        }
    };

    const editProduct = (product) => {
        setProduct({ ...product });
        setProductDialog(true);
    };

    const editBanner = (banner) => {
        setBanner({ ...banner });
        setBannerDialog(true);
        setEditBannerStatus(true);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const confirmDeleteBanner = (banner) => {
        setBanner(banner);
        setDeleteBannerDialog(true);
    };

    const deleteProduct = () => {
        let _products = products.filter((val) => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
    };

    const deleteBanner = async () => {

        const deleteRequest = await fetch(
            'http://almaback.almatv.kz/api/banners/' + banner.id,
            {
                method: 'DELETE',
                headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' }
            }
        );

        deleteRequest = await deleteRequest.json();
        console.log(deleteRequest);

        let _banners = banners.filter((val) => val.id !== banner.id);
        setBanners(_banners);
        setDeleteBannerDialog(false);
        setBanner(emptyBanner);
        toast.current.show({ severity: 'success', summary: 'Отлично', detail: 'Баннер удален', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < banners.length; i++) {
            if (banners[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const isIsoDate = (str) => {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        return true;
    }

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteBannersDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    };

    const deleteSelectedBanners = () => {
        let _banners = banners.filter((val) => !selectedBanners.includes(val));
        setBanners(_banners);
        setDeleteBannersDialog(false);
        setSelectedBanners(null);
        toast.current.show({ severity: 'success', summary: 'Отлично', detail: 'Баннеры удалены', life: 3000 });
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    /* const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    }; */

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _banner = { ...banner };
        _banner[`${name}`] = val;

        setBanner(_banner);
    };

    const onCalendarChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _banner = { ...banner };
        _banner[`${name}`] = val;

        setBanner(_banner);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Создать" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNewBanner} />
                    {/* <Button label="Удалить" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedBanners || !selectedBanners.length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Import" chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.code}
            </>
        );
    };

    /* const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.name}
            </>
        );
    }; */

    const imageBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={`${contextPath}/demo/images/product/${rowData.image}`} alt={rowData.image} className="shadow-2" width="100" />
            </>
        );
    };

    const priceBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Price</span>
                {formatCurrency(rowData.price)}
            </>
        );
    };

    const categoryBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                {rowData.category}
            </>
        );
    };

    const ratingBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Reviews</span>
                <Rating value={rowData.rating} readOnly cancel={false} />
            </>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${rowData.inventoryStatus.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Название</span>
                {rowData.name}
            </>
        );
    };

    const pathBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Путь</span>
                {rowData.path}
            </>
        );
    };

    const activateAtBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Путь</span>
                {rowData.activate_at}
            </>
        );
    };

    const deactivateAtBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Путь</span>
                {rowData.deactivate_at}
            </>
        );
    };

    const createdAtBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Путь</span>
                {rowData.created_at}
            </>
        );
    };

    const updatedAtBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Путь</span>
                {rowData.updated_at}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editBanner(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteBanner(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Баннеры</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Поиск..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Отмена" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            {/* <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} /> */}
            <Button label="Создать" icon="pi pi-check" className="p-button-text" onClick={saveBanner} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="Нет" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Да" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="Нет" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductsDialog} />
            <Button label="Да" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
        </>
    );

    const bannerDialogFooter = (
        <>
            <Button label="Отмена" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Сохранить" icon="pi pi-check" className="p-button-text" onClick={saveBanner} />
        </>
    );
    const deleteBannerDialogFooter = (
        <>
            <Button label="Нет" icon="pi pi-times" className="p-button-text" onClick={hideDeleteBannerDialog} />
            <Button label="Да" icon="pi pi-check" className="p-button-text" onClick={deleteBanner} />
        </>
    );
    const deleteBannersDialogFooter = (
        <>
            <Button label="Нет" icon="pi pi-times" className="p-button-text" onClick={hideDeleteBannersDialog} />
            <Button label="Да" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedBanners} />
        </>
    );



    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={banners}
                        selection={selectedBanners}
                        onSelectionChange={(e) => setSelectedBanners(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Показаны {first} по {last} из {totalRecords} баннеров"
                        globalFilter={globalFilter}
                        emptyMessage="Баннеров не найдено."
                        header={header}
                        responsiveLayout="scroll"
                        sortField="updated_at"
                        sortOrder={-1}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column field="name" header="Название" body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="path" header="Путь" body={pathBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="activate_at" sortable header="Дата активации" body={activateAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="deactivate_at" sortable header="Дата деактивации" body={deactivateAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="created_at" sortable header="Создан" body={createdAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="updated_at" sortable header="Изменен" body={updatedAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No products found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="code" header="Code" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="price" header="Price" body={priceBodyTemplate} sortable></Column>
                        <Column field="category" header="Category" sortable body={categoryBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="rating" header="Reviews" body={ratingBodyTemplate} sortable></Column>
                        <Column field="inventoryStatus" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable> */}

                    <Dialog visible={bannerDialog} style={{ width: '450px' }} header="Баннер" modal className="p-fluid" footer={bannerDialogFooter} dismissableMask={true} onHide={hideDialog}>
                        {product.image && <img src={`${contextPath}/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />}
                        <div className="field">
                            <label htmlFor="name">Название</label>
                            <InputText id="name" value={banner.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !banner.name })} />
                            {submitted && !banner.name && <small className="p-invalid">Название баннера обязательна.</small>}
                        </div>

                        <div className="field">
                            {/* <label htmlFor="banner_image">Изображение</label>
                            <FileUpload name="banner_image" onUpload={onUpload} accept="image/*" maxFileSize={6000000} /> */}
                            <label htmlFor="path">Путь</label>
                            <InputText id="path" value={banner.path} onChange={(e) => onInputChange(e, 'path')} required className={classNames({ 'p-invalid': submitted && !banner.path })} />
                            {submitted && !banner.path && <small className="p-invalid">Путь к картинке обязательна.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="activate_at">Дата активации</label>
                            <Calendar dateFormat="yy-mm-dd" showIcon showButtonBar value={new Date(banner.activate_at)} onChange={(e) => onCalendarChange(e, 'activate_at')} required className={classNames({ 'p-invalid': submitted && !banner.activate_at })}></Calendar>
                            {submitted && !banner.activate_at && <small className="p-invalid">Дата активации обязательна.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="deactivate_at">Дата деактивации</label>
                            <Calendar dateFormat="yy-mm-dd" showIcon showButtonBar value={new Date(banner.deactivate_at)} onChange={(e) => onCalendarChange(e, 'deactivate_at')} required className={classNames({ 'p-invalid': submitted && !banner.deactivate_at })}></Calendar>
                            {submitted && !banner.deactivate_at && <small className="p-invalid">Дата деактивации обязательна.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteBannerDialog} style={{ width: '450px' }} header="Подтверждение" modal footer={deleteBannerDialogFooter} dismissableMask={true} onHide={hideDeleteBannerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {banner && (
                                <span>
                                    Вы уверены что хотите удалить <b>{banner.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteBannersDialog} style={{ width: '450px' }} header="Подтверждение" modal footer={deleteBannersDialogFooter} dismissableMask={true} onHide={hideDeleteBannersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {banner && <span>Вы уверены что хотите удалить выбранные элементы ?</span>}
                        </div>
                    </Dialog>

                    {/* <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog> */}
                </div>
            </div>
        </div>
    );
};

export default Crud;
